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
  const [activeRoundNumber, setActiveRoundNumber] = useState(null);
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

  //call fetch round winners when round number changes
  useEffect(() => {
    if (submissions.length > 0) {
      fetchRoundWinners();
    }
  }, [activeRoundNumber, submissions]);

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

//Check round completion
useEffect(() => {
  const checkRoundCompletion = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3001/tournament/process-round-completion"
      );
      if (response.data.message.includes("completed successfully")) {
        // Round just completed, refresh data
        await fetchTournamentData();
        await fetchRoundWinners();

        window.dispatchEvent(new CustomEvent("tournamentVotesReset"));
      }
    } catch (error) {
      console.error("Error checking round completion:", error);
    }
  };

  // Check every 2 seconds
  const interval = setInterval(checkRoundCompletion, 2000);
  return () => clearInterval(interval);
}, []);

//fetch current active round
useEffect(() => {
  const fetchActiveRound = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3001/tournament/current-round"
      );
      if (response.data.isActive) {
        setActiveRoundNumber(response.data.round);
      } else {
        setActiveRoundNumber(null);
      }
    } catch (error) {
      console.error("Error fetching active round:", error);
      setActiveRoundNumber(null);
    }
  };

  fetchActiveRound();
  const interval = setInterval(fetchActiveRound, 5000);
  return () => clearInterval(interval);
}, []);

useEffect(() => {
  // Clear winners when tournament data changes (new tournament created)
  if (tournamentData && tournamentData.length === 0) {
    clearAllWinners();
  }
}, [tournamentData]);

//Fetch all round winners
const fetchRoundWinners = async () => {
  try {
    // ONLY fetch winners for rounds that should be visible!!!
    const promises = [];

    if (activeRoundNumber >= 1) {
      promises.push(
        axios
          .get("http://localhost:3001/round-winners/0")
          .catch(() => ({ data: { winners: [] } }))
      );
    } else {
      promises.push(Promise.resolve({ data: { winners: [] } }));
    }

    if (activeRoundNumber >= 2) {
      promises.push(
        axios
          .get("http://localhost:3001/round-winners/1")
          .catch(() => ({ data: { winners: [] } }))
      );
    } else {
      promises.push(Promise.resolve({ data: { winners: [] } }));
    }

    if (activeRoundNumber >= 3) {
      promises.push(
        axios
          .get("http://localhost:3001/round-winners/2")
          .catch(() => ({ data: { winners: [] } }))
      );
    } else {
      promises.push(Promise.resolve({ data: { winners: [] } }));
    }

    const [res1, res2, res3] = await Promise.all(promises);

    // Set Round 1 winners (for Round 2 bracket)
    if (res1.data.winners.length > 0) {
      const winners1 = submissions.filter((s) =>
        res1.data.winners.includes(s._id)
      );
      // Ensure exactly 8 winners, pad with null if needed
      const paddedWinners1 = [...winners1];
      while (paddedWinners1.length < 8) paddedWinners1.push(null);
      setRound1Winners(paddedWinners1.slice(0, 8)); // Ensure max 8
    } else {
      setRound1Winners(Array(8).fill(null));
    }

    // Set Round 2 winners (for Round 3 bracket)
    if (res2.data.winners.length > 0) {
      const winners2 = submissions.filter((s) =>
        res2.data.winners.includes(s._id)
      );
      // Ensure exactly 4 winners, pad with null if needed
      const paddedWinners2 = [...winners2];
      while (paddedWinners2.length < 4) paddedWinners2.push(null);
      setRound2Winners(paddedWinners2.slice(0, 4)); // Ensure max 4
    } else {
      setRound2Winners(Array(4).fill(null));
    }

    // Set Round 3 winners (for Round 4 bracket)
    if (res3.data.winners.length > 0) {
      const winners3 = submissions.filter((s) =>
        res3.data.winners.includes(s._id)
      );
      // Ensure exactly 2 winners, pad with null if needed
      const paddedWinners3 = [...winners3];
      while (paddedWinners3.length < 2) paddedWinners3.push(null);
      setSemiFinalWinners(paddedWinners3.slice(0, 2)); // Ensure max 2
    } else {
      setSemiFinalWinners(Array(2).fill(null));
    }
  } catch (error) {
    console.error("Error fetching round winners:", error);
  }
};

const clearAllWinners = () => {
  setRound1Winners(Array(8).fill(null));
  setRound2Winners(Array(4).fill(null));
  setSemiFinalWinners(Array(2).fill(null));
  setFinalWinner(null);
};

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

  //Fetch winners from round
  const handleRoundComplete = async () => {
    await fetchTournamentData();
    await fetchRoundWinners();
  };

//Voting
const handleClickVote = async (
  round,
  matchIndex,
  contenderIndex,
  submission
) => {
  if (!firebaseUID || !submission) return;

  // Check if this round is currently active
  if (activeRoundNumber !== round - 1) {
    alert("Voting is only allowed during the active round!");
    return;
  }

  const roundKey = `round${round}`;
  const previousChoice = votedMatches[roundKey][matchIndex];
  const isSameChoice = previousChoice === contenderIndex;

  try {
    const res = await fetch("http://localhost:3001/votes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firebaseUID,
        round: round - 1, // Convert to 0-based indexing for backend
        matchIndex,
        submissionId: submission._id,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Vote failed");

    // Update local vote matrix
    const updated = { ...votedMatches };
    updated[roundKey][matchIndex] = isSameChoice ? null : contenderIndex;
    setVotedMatches(updated);

    // Persist for THIS user only
    localStorage.setItem(`votes_${firebaseUID}`, JSON.stringify(updated));

    // Sync on-screen vote counts
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
    const roundInactive = activeRoundNumber !== round - 1;

    return (
      <div
        className={`contender ${disabled ? "disabled" : ""} ${
          roundInactive ? "round-inactive" : ""
        }`}
      >
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
            By <span className="name">{submission.author}</span>{" "}
            {submission.date}
          </div>
          <div className="bracket-votes">Votes: {submission.votes}</div>
          <button
            className={`btn btn-sm mt-2 ${
              voted === contenderIdx ? "btn-success" : "btn-outline-success"
            }`}
            onClick={() =>
              handleClickVote(round, matchIdx, contenderIdx, submission)
            }
            disabled={disabled || roundInactive}
            title={roundInactive ? "Voting not active for this round" : ""}
          >
            {voted === contenderIdx
              ? "✓ Voted"
              : roundInactive
              ? "🚫 Inactive"
              : "👍 Vote"}
          </button>
        </div>
      </div>
    );
  };

  //Groups pairs of submissions (contenders) into matches for a given round
  const renderMatches = (entries, round) => {
    const matches = [];
    // Determine expected number of matches for each round
    const expectedMatches =
      round === 1 ? 8 : round === 2 ? 4 : round === 3 ? 2 : 1;

    for (let i = 0; i < expectedMatches; i++) {
      const contender1 = entries[i * 2] || null;
      const contender2 = entries[i * 2 + 1] || null;

      matches.push(
        <div className="match" key={`round-${round}-match-${i}`}>
          {renderContender(contender1, round, i, 0)}
          {renderContender(contender2, round, i, 1)}
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
                <button
                  className="btn btn-secondary"
                  onClick={() => scrollToSection(voteSectionRef)}
                >
                  Vote Now!
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="fw-bold">Tournament has ended</h2>
              <p>Submit your book idea for the next tournament.</p>
              <div className="d-flex justify-content-center mt-4">
                <button
                  className="btn btn-secondary"
                  onClick={handleSubmitIdea}
                >
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