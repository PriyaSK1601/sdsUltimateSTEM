import React from "react";
import "../styles/Podium.css";
import left from "../assets/left_arrow.png";
import right from "../assets/right_arrow.png";
import { Link } from "react-router-dom";

function Podium() {
  return (
    <div className="podium">
      <h1>Previous Submissions</h1>
      <p>Check out the previous winners of past tournaments!</p>
      <div className="card">
        <p>Submission cards will be displayed here!!!</p>
        <div className="left">
          <img src={left} alt="Left arrow" />
        </div>
        <div className="right">
          <img src={right} alt="Right arrow" />
        </div>
      </div>
    </div>
  );
}

export default Podium;
