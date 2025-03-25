import React from "react";
import "../styles/Tournament.css";

function Tournament({ submissions }) {
    return (
        <div className="tournament-container">
            <h2>Tournament Contenders</h2>
            {submissions.length === 0 ? (
                <p>No Submissions</p>
            ) : (
                <div className="submissions-list">
                    {submissions.map((submission, index) => (
                        <div key={index} className="card">
                            <div
                                className="card-image"
                                style={{
                                    backgroundImage: submission.image
                                        ? `url(${submission.image})`
                                        : "none",
                                }}
                            ></div>
                                <div className="category">{submission.category}</div>
                                <div className="heading">{submission.title}</div>
                                <div className="description">{submission.description}</div>
                                <div className="author">
                                    By <span className="name">{submission.author}</span> {submission.date}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Tournament;
