import React, { useState } from "react";
import "../styles/Tournament.css";

// Draws a curved SVG connector between contenders
function Connector({ fromTop, toTop }) {
  const height = Math.abs(toTop - fromTop);
  const top = Math.min(fromTop, toTop);

  return (
    <svg
      style={{
        position: "absolute",
        top: top + "px",
        left: "100%",
        overflow: "visible",
        zIndex: 0,
      }}
      width="80"
      height={height}
    >
      <path
        d={`
          M0,${fromTop - top}
          C20,${fromTop - top} 60,${toTop - top} 80,${toTop - top}
        `}
        stroke="#ccc"
        fill="transparent"
        strokeWidth="2"
      />
    </svg>
  );
}

function Tournament({ submissions }) {
  const paddedSubmissions = submissions.slice(0, 16);
  while (paddedSubmissions.length < 16) {
    paddedSubmissions.push(null);
  }

  const isRound1Ready = paddedSubmissions.every((s) => s !== null);

  const [round1Winners, setRound1Winners] = useState(Array(8).fill(null));
  const [round2Winners, setRound2Winners] = useState(Array(4).fill(null));
  const [semiFinalWinners, setSemiFinalWinners] = useState(Array(2).fill(null));
  const [finalWinner, setFinalWinner] = useState(null);

  const handleClick = (round, matchIndex, contenderIndex, submission) => {
    if (!submission) return;

    if (round > 1 && !isRound1Ready) return;

    if (round === 1) {
      const updated = [...round1Winners];
      updated[matchIndex] = submission;
      setRound1Winners(updated);
    } else if (round === 2) {
      const updated = [...round2Winners];
      updated[matchIndex] = submission;
      setRound2Winners(updated);
    } else if (round === 3) {
      const updated = [...semiFinalWinners];
      updated[matchIndex] = submission;
      setSemiFinalWinners(updated);
    } else if (round === 4) {
      setFinalWinner(submission);
    }
  };

  const getContender = (submission, round, matchIndex, contenderIndex) => {
    const isClickable = submission && (round === 1 || isRound1Ready);

    return (
      <div
        className={`contender ${!submission ? "empty" : ""} ${!isClickable ? "disabled" : ""}`}
        onClick={() => isClickable && handleClick(round, matchIndex, contenderIndex, submission)}
      >
        {submission ? submission.title : "Waiting..."}
      </div>
    );
  };

  const getRoundMatches = (entries, round, nextRound = null) => {
    const matches = [];
    const totalMatches = Math.ceil(entries.length / 2);

    for (let i = 0; i < totalMatches; i++) {
      const submission1 = entries[i * 2] || null;
      const submission2 = entries[i * 2 + 1] || null;

      matches.push(
        <div className="match" key={`round-${round}-match-${i}`}>
          {getContender(submission1, round, i, 0)}
          {getContender(submission2, round, i, 1)}
          {nextRound && nextRound[i] && (
            <Connector fromTop={40} toTop={40} />
          )}
        </div>
      );
    }
    return matches;
  };

  return (
    <div className="tournament-container">
      <h2>Tournament Bracket</h2>
      {!isRound1Ready && (
        <p className="warning">⚠️ Please ensure all 16 submissions are present before progressing.</p>
      )}
      <div className="bracket">
        <div className="bracket-round">
          <div className="round-label">Round 1</div>
          {getRoundMatches(paddedSubmissions, 1, round1Winners)}
        </div>

        <div className="bracket-round">
          <div className="round-label">Quarterfinals</div>
          {getRoundMatches(round1Winners, 2, round2Winners)}
        </div>

        <div className="bracket-round">
          <div className="round-label">Semifinals</div>
          {getRoundMatches(round2Winners, 3, semiFinalWinners)}
        </div>

        <div className="bracket-round">
          <div className="round-label">Final</div>
          {getRoundMatches(semiFinalWinners, 4, [finalWinner])}
        </div>

        <div className="bracket-round">
          <div className="round-label">Champion</div>
          <div className="winner">
            {finalWinner ? (
              <>
                🏆 {finalWinner.title}
              </>
            ) : (
              <div className="contender empty">Waiting...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Tournament;
