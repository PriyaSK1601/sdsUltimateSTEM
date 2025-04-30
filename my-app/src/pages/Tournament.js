import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Tournament.css";
import CountdownTimer from "../components/CountdownTimer";
import "bootstrap/dist/css/bootstrap.min.css";

function Tournament({ submissions }) {
  const [countdownData, setCountdownData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedCountdown = localStorage.getItem("tournamentCountdown");
    if (savedCountdown) {
      setCountdownData(JSON.parse(savedCountdown));
    }
  }, []);

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
          {countdownData ? (
            <>
              {countdownData.isActive && (
                <h2 className="fw-bold">Current round ends in ...</h2>
              )}
              <CountdownTimer
                targetDate={countdownData.targetDate}
                isActive={countdownData.isActive}
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
              <p>Submit your book idea for the next tournament!</p>
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
              {submissions.map((submission, index) => (
                <div className="submission-card" key={index}>
                  <div
                    className="card-image"
                    style={{
                      backgroundImage: submission.image
                        ? `url(${submission.image})`
                        : "none",
                    }}
                  ></div>
                  <div className="card-content">
                    <div className="category">{submission.category}</div>
                    <div className="heading">{submission.title}</div>
                    <div className="description">{submission.description}</div>
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
