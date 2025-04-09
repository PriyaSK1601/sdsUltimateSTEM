import React, { useState } from "react";
import "../styles/Podium.css";
import left from "../assets/left_arrow.png";
import right from "../assets/right_arrow.png";
import "bootstrap/dist/css/bootstrap.min.css";

function Podium({ submissions = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrevious = () => {
    if (submissions.length === 0) return;
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? submissions.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    if (submissions.length === 0) return;
    setCurrentIndex((prevIndex) =>
      prevIndex === submissions.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className="row h-100 justify-content-center pt-5">
      <div className="col-md-11 mt-5">
        <div className="bg-secondary bg-opacity-25 p-5 mt-5 podium-container">
          <h1 className="text-center">Previous Submissions</h1>
          <div className="bg-secondary bg-opacity-50 card-container">
            <button className="btn left-button" onClick={handlePrevious}>
              <img src={left} alt="left arrow" />
            </button>
            <button className="btn right-button" onClick={handleNext}>
              <img src={right} alt="right arrow" />
            </button>

            {submissions.length === 0 ? (
              <div className="text-center p-5">
                <p>No previous submissions yet!</p>
              </div>
            ) : (
              <div className="card">
                <div
                  className="card-image"
                  style={{
                    backgroundImage: submissions[currentIndex].image
                      ? `url(${submissions[currentIndex].image})`
                      : "none",
                  }}
                ></div>
                <div className="card-content">
                  <div className="category badge text-center category-badge">
                    {submissions[currentIndex].category}
                  </div>
                  <h3 className="heading text-center">
                    {submissions[currentIndex].title}
                  </h3>
                  <div className="description text-center">
                    {submissions[currentIndex].description}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Podium;
