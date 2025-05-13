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
  const [votedMatches, setVotedMatches] = useState({
    round1: Array(8).fill(null),
    round2: Array(4).fill(null),
    round3: Array(2).fill(null),
    round4: Array(1).fill(null),
  });
  const [firebaseUID, setFirebaseUID] = useState(null);
  const voteSection = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setFirebaseUID(user.uid);
      else setFirebaseUID(null);
    });
    return () => unsubscribe();
  }, []);

  const scrollToSection = (elementRef) => {
    window.scrollTo({
      top: elementRef.current.offsetTop,
      behavior: "smooth",
    });
  };

  const fetchTournamentData = async () => {
    try {
      const response = await axios.get("http://localhost:3001/tournament");
      if (response.data && response.data.length > 0) {
        setTournamentData(response.data);
        const now = new Date();
        const activeRounds = response.data.filter(
          (round) => new Date(round.endDate) > now
        );

        if (activeRounds.length > 0) {
          activeRounds.sort(
            (a, b) => new Date(a.endDate) - new Date(b.endDate)
          );
          setCurrentRound({
            round: activeRounds[0].round,
            name: activeRounds[0].roundName,
            targetDate: activeRounds[0].endDate,
          });
          setIsActive(true);
        } else {
          setCurrentRound(null);
          setIsActive(false);
        }
      } else {
        setTournamentData([]);
        setCurrentRound(null);
        setIsActive(false);
      }
    } catch (error) {
      console.error("Error fetching tournament data:", error);
      setCurrentRound(null);
      setIsActive(false);
    }
  };

  useEffect(() => {
    fetchTournamentData();
    const intervalId = setInterval(fetchTournamentData, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const handleRoundComplete = () => {
    fetchTournamentData();
  };

  useEffect(() => {
    const fetchApprovedSubmissions = async () => {
      try {
        const response = await fetch("http://localhost:3001/submissions");
        const data = await response.json();
        const approved = data.filter(
          (submission) => submission.status === "approved"
        );
        setSubmissions(approved.slice(0, 16));

        const savedVotes = localStorage.getItem("tournamentVotes");
        if (savedVotes) {
          setVotedMatches(JSON.parse(savedVotes));
        }
      } catch (error) {
        console.error("Error fetching submissions:", error);
      }
    };
    fetchApprovedSubmissions();
  }, []);

  const paddedSubmissions = [...submissions];
  while (paddedSubmissions.length < 16) {
    paddedSubmissions.push(null);
  }
  const isRound1Ready = paddedSubmissions.every((s) => s !== null);

  const handleClick = async (round, matchIndex, contenderIndex, submission) => {
    if (!submission || !firebaseUID) return;

    try {
      const response = await fetch(
        `http://localhost:3001/submissions/${submission._id}/vote`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firebaseUID,
            round,
          }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        const updatedSubmission = result.submission;
        const updatedSubmissions = submissions.map((s) =>
          s._id === updatedSubmission._id ? updatedSubmission : s
        );
        setSubmissions(updatedSubmissions);

        const roundKey = `round${round}`;
        const newVotedMatches = { ...votedMatches };
        newVotedMatches[roundKey][matchIndex] = contenderIndex;
        setVotedMatches(newVotedMatches);
        localStorage.setItem("tournamentVotes", JSON.stringify(newVotedMatches));

        alert(`✅ Your vote for "${submission.title}" has been recorded!`);
      } else {
        alert(`⚠️ ${result.message || "Vote failed"}`);
      }
    } catch (error) {
      console.error("Error voting:", error);
      alert("⚠️ Error voting. Please try again.");
    }
  };

  const getContender = (submission, round, matchIndex, contenderIndex) => {
    if (!submission) {
      return <div className="contender empty">Waiting...</div>;
    }

    const roundWinners =
      round === 1
        ? round1Winners
        : round === 2
        ? round2Winners
        : round === 3
        ? semiFinalWinners
        : round === 4
        ? [finalWinner]
        : [];

    const winner = roundWinners[matchIndex];
    const isSelected = winner && winner._id === submission._id;

    const roundKey = `round${round}`;
    const votedContenderIndex = votedMatches[roundKey][matchIndex];

    const isDisabled =
      votedContenderIndex !== null && votedContenderIndex !== contenderIndex;

    return (
      <div className={`contender ${isDisabled ? "disabled" : ""}`}>
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
              votedContenderIndex === contenderIndex
                ? "btn-success"
                : "btn-outline-success"
            }`}
            onClick={() =>
              handleClick(round, matchIndex, contenderIndex, submission)
            }
            disabled={isDisabled}
          >
            {votedContenderIndex === contenderIndex ? "✓ Voted" : "👍 Vote"}
          </button>
        </div>
      </div>
    );
  };

  const getRoundMatches = (entries, round) => {
    const matches = [];
    const totalMatches = Math.ceil(entries.length / 2);
    for (let i = 0; i < totalMatches; i++) {
      const submission1 = entries[i * 2] || null;
      const submission2 = entries[i * 2 + 1] || null;

      matches.push(
        <div className="match" key={`round-${round}-match-${i}`}>
          {getContender(submission1, round, i, 0)}
          {getContender(submission2, round, i, 1)}
        </div>
      );
    }
    return matches;
  };

  const handleSubmitIdea = () => navigate("/submission");

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
                  onClick={() => scrollToSection(voteSection)}
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
        {!isRound1Ready && (
          <p className="warning">
            ⚠️ Please ensure all 16 submissions are approved before starting the
            tournament.
          </p>
        )}
        {submissions.length === 0 ? (
          <p>No submissions available yet.</p>
        ) : (
          <div className="bracket">
            <div ref={voteSection} className="bracket-round">
              <div className="round-label">Round 1</div>
              {getRoundMatches(paddedSubmissions, 1)}
            </div>
            <div className="bracket-round">
              <div className="round-label">Round 2</div>
              {getRoundMatches(round1Winners, 2)}
            </div>
            <div className="bracket-round">
              <div className="round-label">Round 3</div>
              {getRoundMatches(round2Winners, 3)}
            </div>
            <div className="bracket-round">
              <div className="round-label">Round 4</div>
              {getRoundMatches(semiFinalWinners, 4)}
            </div>
            <div className="bracket-round">
              <div className="round-label">Champion</div>
              <div className="winner">
                {finalWinner ? (
                  <>🏆 {finalWinner.title}</>
                ) : (
                  <div className="contender empty">Waiting...</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Tournament;
