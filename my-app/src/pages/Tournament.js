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
    // Load tournament data
    const loadTournamentData = () => {
      const savedTournament = localStorage.getItem("tournamentData");
      if (savedTournament) {
        const parsedData = JSON.parse(savedTournament);
        setTournamentData(parsedData);

        // Get current round
        if (parsedData.isActive && parsedData.rounds.length > 0) {
          const currentRoundIndex = parsedData.currentRound;
          if (currentRoundIndex < parsedData.rounds.length) {
            setCurrentRound(parsedData.rounds[currentRoundIndex]);
          } else {
            // Tournament has finished all rounds
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

    // Set up an interval to check for round changes
    const intervalId = setInterval(loadTournamentData, 2000);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [refreshKey]);

  const handleSubmitIdea = () => {
    navigate("/submission");
  };

  const handleVoteNow = () => {
    navigate("/vote");
  };

  return (
    <div className="container my-5 tournament-submission">
      <div className="row justify-content-center">
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
                <div className="px-4">
                  <button
                    className="btn btn-secondary"
                    onClick={handleSubmitIdea}
                  >
                    Submit an Idea!
                  </button>
                </div>
                <div className="px-4">
                  <button className="btn btn-secondary" onClick={handleVoteNow}>
                    Vote Now!
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <h2 className="fw-bold">Tournament has ended</h2>
              <p>Submit your book idea for the next tournament.</p>
              <div className="d-flex justify-content-center mt-4">
                <div className="px-4">
                  <button
                    className="btn btn-secondary"
                    onClick={handleSubmitIdea}
                  >
                    Submit an Idea!
                  </button>
                </div>
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
    </div>
  );
}

export default Tournament;
