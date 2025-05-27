import React, { useState, useEffect } from "react";
import "../styles/Podium.css";
import left from "../assets/left_arrow.png";
import right from "../assets/right_arrow.png";
import "bootstrap/dist/css/bootstrap.min.css";

function Podium() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submissions, setSubmissions] = useState([]);

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
    <div className="row justify-content-center py-5">
      <div className="col-xl-10 col-lg-11 col-md-12">
        <div className="bg-secondary bg-opacity-25 p-4 p-md-5 mt-5 mb-5 podium-container">
          <h1 className="text-center mb-4">Previous Submissions</h1>
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
                {submissions[currentIndex].image && (
                  <div className="card-image-container">
                    <img
                      src={`http://localhost:3001/image/${submissions[currentIndex]._id}`}
                      alt="Submission"
                    />
                  </div>
                )}
                <div className="card-content">
                  <h3 className="heading text-center">
                    {submissions[currentIndex].title}
                  </h3>
                  <div className="category badge text-center category-badge">
                    {submissions[currentIndex].category}
                  </div>
                  <div className="description text-center">
                    {submissions[currentIndex].description}
                  </div>
                  <div className="author text-center">
                    By{" "}
                    <span className="name">
                      {submissions[currentIndex].author}
                    </span>{" "}
                    {submissions[currentIndex].date}
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
