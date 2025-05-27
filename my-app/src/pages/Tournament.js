import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import CountdownTimer from "../components/CountdownTimer";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/Tournament.css";
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
  const voteSectionRef = useRef(null);
  const [activeRoundNumber, setActiveRoundNumber] = useState(null);
  const navigate = useNavigate();

    // TEMP MOCK DATA FOR STYLING - REMOVE LATER
  useEffect(() => {
    if (submissions.length === 0) {
      const mockSubmissions = Array.from({ length: 16 }, (_, i) => ({
        _id: `mock-id-${i}`,
        title: `Book Idea ${i + 1}`,
        author: `Author ${i + 1}`,
        description: `This is a mock description for Book Idea ${i + 1}.`,
        votes: Math.floor(Math.random() * 100),
      }));
      setSubmissions(mockSubmissions);
    }
  }, [submissions]);


  const openModal = (submission, matchIndex, contenderIndex, round) => {
    console.log("Opening modal with:", submission, matchIndex, contenderIndex, round);
    setSelectedSubmission({submission, matchIndex, contenderIndex, round});
    setShowModal(true);
  };

  const closeModal = () => {
    console.log("Closing modal");
    setSelectedSubmission(null);
    setShowModal(false);
  };

  // Sets user when logged in/out
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) setFirebaseUID(user.uid);
        else setFirebaseUID(null);
      });
      return () => unsubscribe();
  }, []);

  // Gets 16 submissions for tournament 
  useEffect(() => {
    fetchTournamentData();
    const interval = setInterval(fetchTournamentData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetches approved submissions
  useEffect(() => {
    fetchApprovedSubmissions();
  }, []);

  // Call fetch round winners when round number changes
  useEffect(() => {
    if (submissions.length > 0) {
      fetchRoundWinners();
    }
  }, [activeRoundNumber, submissions]);

  // Listener for reset votes 
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

  // Check round completion
  useEffect(() => {
    const checkRoundCompletion = async () => {
      try {
        const response = await fetch("http://localhost:3001/submissions");
        const data = await response.json();
        const approved = data.filter((submission) => submission.status === "approved");
        setSubmissions(approved.slice(0, 16));

        const savedVotes = localStorage.getItem("tournamentVotes");
        if (savedVotes) {
          setVotedMatches(JSON.parse(savedVotes));
        }
      } catch (error) {
        console.error("Error checking round completion:", error);
      }
    };

    // Check every 10 seconds
    const interval = setInterval(checkRoundCompletion, 10000);
    return () => clearInterval(interval);
  }, []);

  // Fetch current active round
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


    const roundKey = `round${round}`;
    const votedContenderIndex = votedMatches[roundKey][matchIndex];

    // Already voted
    if (votedContenderIndex !== null) {
      return;
    }
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


  const getContender = (submission, round, matchIndex, contenderIndex) => {
    if (!submission) {
      return <div className="contender empty">TBD</div>;
    }
  };

  // Fetch winners from round
  const handleRoundComplete = async () => {
    await fetchTournamentData();
    await fetchRoundWinners();
  };

  // Voting
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
    const votedContenderIndex = votedMatches[roundKey][matchIndex];
    const isDisabled = votedContenderIndex !== null;

    return (
      <div className="contender"
      onClick={() => openModal(submission, matchIndex, contenderIndex, round)}
      >
       <div className="title">
          {submission.title}
        </div>

        <button
            className={`vote-btn btn-sm mt-2 ${
              votedContenderIndex === contenderIndex ? "btn-success" : "btn-outline-success"

            }`}
            onClick={() =>
              handleClickVote(round, matchIdx, contenderIdx, submission)
            }
            disabled={disabled || roundInactive}
            title={roundInactive ? "Voting not active for this round" : ""}
          >

            {votedContenderIndex === contenderIndex ? "✓ Voted" : "Vote"}

          </button>
        <div className="votes">Vote count: {submission.votes}</div>
      </div>
    );
  };

  // Groups pairs of submissions (contenders) into matches for a given round
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

  // Navigates to submission page
  const handleSubmitIdea = () => {
    navigate("/submission");
  };


  const paddedSubmissions = [...submissions];
  while (paddedSubmissions.length < 16) paddedSubmissions.push(null);
  const isRound1Ready = paddedSubmissions.every((s) => s !== null);

  // JSX
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
      
    {showModal && selectedSubmission && (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{selectedSubmission.submission.title}</h5>
            <button onClick={closeModal} className="close-button">✖</button>
          </div>
          <div className="modal-body">
            <p className="bracket-author">
              By {selectedSubmission.submission.author}
            </p>
            
            <p><strong>Description: </strong>{selectedSubmission.submission.description}</p>
            
            {selectedSubmission.submission.image && (
              <img
                className="submission-image"
                src={`http://localhost:3001/image/${selectedSubmission.submission._id}`}
                alt={selectedSubmission.submission.title}
              />
            )}
         <p><strong>Vote count: </strong>{selectedSubmission.submission.votes}</p>
          </div>
        </div>
      </div>
    )}
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
              {getRoundMatches(semiFinalWinners, 4)}
            </div>
            <div className="bracket-round">
              <div className="round-label">Winner</div>
              <div className="final-winner">
                {finalWinner ? finalWinner.title : "TBD"}
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Tournament;