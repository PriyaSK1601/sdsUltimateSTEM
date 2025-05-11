import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Tournament.css";
import CountdownTimer from "../components/CountdownTimer";
import "bootstrap/dist/css/bootstrap.min.css";

function Tournament({ submissions }) {
  const [tournamentData, setTournamentData] = useState(null);
  const [currentRound, setCurrentRound] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [submissions, setSubmissions] = useState([]);
  const [round1Winners, setRound1Winners] = useState(Array(8).fill(null));
  const [round2Winners, setRound2Winners] = useState(Array(4).fill(null));
  const [semiFinalWinners, setSemiFinalWinners] = useState(Array(2).fill(null));
  const [finalWinner, setFinalWinner] = useState(null);
  const [countdownData, setCountdownData] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchApprovedSubmissions = async () => {
      try {
        const response = await fetch("http://localhost:3001/submissions");
        const data = await response.json();
        const approved = data.filter(
          (submission) => submission.status === "approved"
        );
        setSubmissions(approved);
      } catch (error) {
        console.error("Error fetching submissions:", error);
      }
    };

    fetchApprovedSubmissions();
  }, []);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "tournamentData" || e.key === null) {
        setRefreshKey((prevKey) => prevKey + 1);
      }
    };

    window.addEventListener("storage", handleStorageChange);

    const loadTournamentData = () => {
      const savedTournament = localStorage.getItem("tournamentData");
      if (savedTournament) {
        const parsedData = JSON.parse(savedTournament);
        setTournamentData(parsedData);

        if (parsedData.isActive && parsedData.rounds.length > 0) {
          const currentRoundIndex = parsedData.currentRound;
          if (currentRoundIndex < parsedData.rounds.length) {
            setCurrentRound(parsedData.rounds[currentRoundIndex]);
          } else {
            setCurrentRound(null);
          }
        } else {
          setCurrentRound(null);
        }
      } else {
        setTournamentData(null);
        setCurrentRound(null);
      }
    };

    loadTournamentData();
    const intervalId = setInterval(loadTournamentData, 2000);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [refreshKey]);

  useEffect(() => {
    const fetchApprovedSubmissions = async () => {
      try {
        const response = await fetch("http://localhost:3001/submissions");
        const data = await response.json();
        const approved = data.filter(
          (submission) => submission.status === "approved"
        );
        setSubmissions(approved.slice(0, 16));
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
    if (!submission) return;

    try {
      const response = await fetch(
        `http://localhost:3001/submissions/${submission._id}/vote`,
        {
          method: "PATCH",
        }
      );

      if (response.ok) {
        const updatedSubmission = await response.json();

        // Update local state with new votes
        const updatedSubmissions = submissions.map((s) =>
          s._id === updatedSubmission.submission._id
            ? updatedSubmission.submission
            : s
        );
        setSubmissions(updatedSubmissions);

        alert(`✅ Your vote for "${submission.title}" has been recorded!`);
      } else {
        console.error("Vote failed:", await response.text());
        alert("⚠️ Vote failed. Please try again.");
      }
    } catch (error) {
      console.error("Error voting:", error);
      alert("⚠️ Error voting. Please check your connection.");
    }
  };

  const getContender = (submission, round, matchIndex, contenderIndex) => {
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
    const isSelected = winner && winner._id === submission?._id;

    return (
      <div className={`contender ${!submission ? "empty" : ""}`}>
        {submission ? (
          <>
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
              <div className="bracket-description">
                {submission.description}
              </div>
              <div className="bracket-author">
                By <span className="name">{submission.author}</span>{" "}
                {submission.date}
              </div>
              <div className="bracket-votes">Votes: {submission.votes}</div>
              <button
                className={`btn btn-sm mt-2 ${
                  isSelected ? "btn-success" : "btn-outline-success"
                }`}
                onClick={() =>
                  handleClick(round, matchIndex, contenderIndex, submission)
                }
              >
                👍 Vote
              </button>
            </div>
          </>
        ) : (
          "Waiting..."
        )}
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
  const handleVoteNow = () => navigate("/vote");

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
                isActive={tournamentData.isActive}
              />
              <div className="d-flex justify-content-center mt-4">
                <button className="btn btn-secondary" onClick={handleVoteNow}>
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
          {submissions.length === 0 ? (
            <p className="py-4">No Submissions</p>
          ) : (
            <div className="submissions-list">
              {submissions
                .filter((sub) => sub.status === "approved")
                .map((submission, index) => (
                  <div className="submission-card" key={index}>
                    {/* Fetch the image URL dynamically from your API */}
                    <div
                      className="card-image"
                      style={{
                        backgroundImage: `url(http://localhost:3001/image/${submission._id})`, // Correctly set the image URL
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    ></div>
                    <div className="card-content">
                      <div className="category">{submission.category}</div>
                      <div className="heading">{submission.title}</div>
                      <div className="description">
                        {submission.description}
                      </div>
                      <div className="author">
                        By <span className="name">{submission.author}</span>{" "}
                        {submission.date}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
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
            <div className="bracket-round">
              <div className="round-label">Round 1</div>
              {getRoundMatches(paddedSubmissions, 1)}
            </div>
            <div className="bracket-round">
              <div className="round-label">Quarterfinals</div>
              {getRoundMatches(round1Winners, 2)}
            </div>
            <div className="bracket-round">
              <div className="round-label">Semifinals</div>
              {getRoundMatches(round2Winners, 3)}
            </div>
            <div className="bracket-round">
              <div className="round-label">Final</div>
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
