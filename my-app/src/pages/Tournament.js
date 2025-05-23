import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Tournament.css";
import CountdownTimer from "../components/CountdownTimer";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

function Tournament() {
  const [tournamentData, setTournamentData] = useState(null);
  const [currentRound, setCurrentRound] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [round1Winners, setRound1Winners] = useState(Array(8).fill(null));
  const [round2Winners, setRound2Winners] = useState(Array(4).fill(null));
  const [semiFinalWinners, setSemiFinalWinners] = useState(Array(2).fill(null));
  const [finalWinner, setFinalWinner] = useState(null);
  const [votedMatches, setVotedMatches] = React.useState({
    round1: Array(8).fill(null),
    round2: Array(4).fill(null),
    round3: Array(2).fill(null),
    round4: Array(1).fill(null),
  });
  const [firebaseUID, setFirebaseUID] = useState(null);
  const voteSectionRef = useRef(null);
  const navigate = useNavigate();
  
  
  //Sets user when logged in/out
  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setFirebaseUID(user.uid);
      else setFirebaseUID(null);
    });
    return () => unsubscribe();
}, []);


  //Gets 16 submissions for tournament 
  useEffect(() => {
    fetchTournamentData();
    const interval = setInterval(fetchTournamentData, 5000);
    return () => clearInterval(interval);
  }, []);

  //Fetches approved submissions
  useEffect(() => {
    fetchApprovedSubmissions();
  }, []);

  //Listener for reset votes 
  useEffect(() => {
    const emptyVotes = {
      round1: Array(8).fill(null),
      round2: Array(4).fill(null),
      round3: Array(2).fill(null),
      round4: Array(1).fill(null),
    };

    const handleReset = () => {
      // 1. reset the “which button did I vote” state
      setVotedMatches(emptyVotes);

      // 2. zero out on-screen vote counts right away
      setSubmissions(prev =>
        prev.map(s => (s ? { ...s, votes: 0 } : s))
      );
    };

    window.addEventListener("tournamentVotesReset", handleReset);
    return () => window.removeEventListener("tournamentVotesReset", handleReset);
}, []);

  //Scrolls to tournamnet
  const scrollToSection = (ref) => {
    if (ref.current) {
      window.scrollTo({ top: ref.current.offsetTop, behavior: "smooth" });
    }
  };

  //Gets data from databse every 5 seconds
  const fetchTournamentData = async () => {
    try {
      const response = await axios.get("http://localhost:3001/tournament");
      const data = response.data;
      setTournamentData(data || []);
      if (data?.length > 0) {
        const now = new Date();
        const active = data.filter((round) => new Date(round.endDate) > now);
        if (active.length > 0) {
          active.sort((a, b) => new Date(a.endDate) - new Date(b.endDate));
          setCurrentRound({
            round: active[0].round,
            name: active[0].roundName,
            targetDate: active[0].endDate,
          });
          setIsActive(true);
        } else {
          setCurrentRound(null);
          setIsActive(false);
        }
      } else {
        setCurrentRound(null);
        setIsActive(false);
      }
    } catch (err) {
      console.error("Error fetching tournament data:", err);
      setCurrentRound(null);
      setIsActive(false);
    }
  };

  //Gets approved submissions from backend
  const fetchApprovedSubmissions = async () => {
    try {
      const response = await fetch("http://localhost:3001/submissions");
      const data = await response.json();
      const approved = data.filter((s) => s.status === "approved");
      setSubmissions(approved.slice(0, 16));
      const savedVotes = localStorage.getItem("tournamentVotes");
      if (savedVotes) setVotedMatches(JSON.parse(savedVotes));
    } catch (err) {
      console.error("Error fetching submissions:", err);
    }
  };

  //Fetches winners from rounds 1 and 2 using their submission IDs.
  //Filters winners from the submissions list.
  const handleRoundComplete = async () => {
    await fetchTournamentData();
    try {
      const res1 = await axios.get("http://localhost:3001/round-winners/1");
      const winnerIds1 = res1.data.winners;
      const winners1 = submissions.filter((s) => winnerIds1.includes(s._id));
      setRound1Winners(winners1);

      const res2 = await axios.get("http://localhost:3001/round-winners/2");
      const winnerIds2 = res2.data.winners;
      const winners2 = submissions.filter((s) => winnerIds2.includes(s._id));
      setRound2Winners(winners2);
    } catch (err) {
      console.error("Failed to fetch round winners:", err);
    }
  };

  //Voting 
  const handleClickVote = async (round, matchIndex, contenderIndex, submission) => {
  if (!firebaseUID || !submission) return;          // must be logged in

  const roundKey       = `round${round}`;
  const previousChoice = votedMatches[roundKey][matchIndex];
  const isSameChoice   = previousChoice === contenderIndex; // user clicked same button

  try {
    // POST vote = backend
    const res = await fetch("http://localhost:3001/votes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firebaseUID,
        round,
        matchIndex,
        submissionId: submission._id,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Vote failed");

    //Update local vote matrix
    const updated = { ...votedMatches };
    updated[roundKey][matchIndex] = isSameChoice ? null : contenderIndex;
    setVotedMatches(updated);

    //Persist for THIS user only
    localStorage.setItem(`votes_${firebaseUID}`, JSON.stringify(updated));

    //Sync on-screen vote counts
    if (data.oldSubmission) {
      setSubmissions((prev) =>
        prev.map((s) =>
          s._id === data.oldSubmission._id ? data.oldSubmission : s
        )
      );
    }
    setSubmissions((prev) =>
      prev.map((s) => (s._id === data.submission._id ? data.submission : s))
    );
  } catch (err) {
    console.error(err);
    alert(`⚠️ ${err.message}`);
  }
};

  //Renders submission card
  const renderContender = (submission, round, matchIdx, contenderIdx) => {
    if (!submission) return <div className="contender empty">Waiting...</div>;

    const voted = votedMatches[`round${round}`][matchIdx];
    const disabled = voted !== null && voted !== contenderIdx;

    return (
      <div className={`contender ${disabled ? "disabled" : ""}`}>
        {submission.image && (
          <img
            className="bracket-image"
            src={`http://localhost:3001/image/${submission._id}`}
            alt={submission.title}
          />
        )}
        <div className="card-content">
          <div className="bracket-title">{submission.title}</div>
          <div className="bracket-category">{submission.category}</div>
          <div className="bracket-description">{submission.description}</div>
          <div className="bracket-author">
            By <span className="name">{submission.author}</span> {submission.date}
          </div>
          <div className="bracket-votes">Votes: {submission.votes}</div>
          <button
            className={`btn btn-sm mt-2 ${
              voted === contenderIdx ? "btn-success" : "btn-outline-success"
            }`}
            onClick={() => handleClickVote(round, matchIdx, contenderIdx, submission)}
            disabled={disabled}
          >
            {voted === contenderIdx ? "✓ Voted" : "👍 Vote"}
          </button>
        </div>
      </div>
    );
  };

  //Groups pairs of submissions (contenders) into matches for a given round
  const renderMatches = (entries, round) => {
    const matches = [];
    for (let i = 0; i < Math.ceil(entries.length / 2); i++) {
      matches.push(
        <div className="match" key={`round-${round}-match-${i}`}>
          {renderContender(entries[i * 2], round, i, 0)}
          {renderContender(entries[i * 2 + 1], round, i, 1)}
        </div>
      );
    }
    return matches;
  };

  const handleSubmitIdea = () => {
    navigate("/submission");
  };

  //Helper to find index for each match
  const contenderIndexForId = (subId, roundKey, matchIdx) => {
    const source = roundKey === "round1"
      ? paddedSubmissions
      : roundKey === "round2"
        ? round1Winners
        : roundKey === "round3"
          ? round2Winners
          : semiFinalWinners;            // round4

    const a = source[matchIdx * 2];
    const b = source[matchIdx * 2 + 1];
    if (a && a._id === subId) return 0;
    if (b && b._id === subId) return 1;
    return null;
  };

  const paddedSubmissions = [...submissions];
  while (paddedSubmissions.length < 16) paddedSubmissions.push(null);
  const isRound1Ready = paddedSubmissions.every((s) => s !== null);

  //JSX
  return (
    <div className="tournament-container">
      <div className="container my-3 row justify-content-center">
        <div className="col-sm-8 text-center">
          {currentRound ? (
            <>
              <h2 className="fw-bold">{currentRound.name}</h2>
              <h3>Ends in:</h3>
              <CountdownTimer
                targetDate={currentRound.targetDate}
                isActive={isActive}
                onRoundComplete={handleRoundComplete}
              />
              <div className="d-flex justify-content-center mt-4">
                <button className="btn btn-secondary" onClick={() => scrollToSection(voteSectionRef)}>
                  Vote Now!
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="fw-bold">Tournament has ended</h2>
              <p>Submit your book idea for the next tournament.</p>
              <div className="d-flex justify-content-center mt-4">
                <button className="btn btn-secondary" onClick={handleSubmitIdea}>
                  Submit an Idea!
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="header">
        {submissions.length === 0 ? (
          <p>No submissions available yet.</p>
        ) : (
          <div className="bracket">
            <div ref={voteSectionRef} className="bracket-round">
              <div className="round-label">Round 1</div>
              {renderMatches(paddedSubmissions, 1)}
            </div>
            <div className="bracket-round">
              <div className="round-label">Round 2</div>
              {renderMatches(round1Winners, 2)}
            </div>
            <div className="bracket-round">
              <div className="round-label">Round 3</div>
              {renderMatches(round2Winners, 3)}
            </div>
            <div className="bracket-round">
              <div className="round-label">Round 4</div>
              {renderMatches(semiFinalWinners, 4)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Tournament;