import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/profile.css";
import "bootstrap/dist/css/bootstrap.min.css";

function ViewAllSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await fetch("http://localhost:3001/submissions");
        const data = await response.json();
        setSubmissions(data);
      } catch (error) {
        console.error("Error fetching all submissions:", error);
      }
    };

    fetchSubmissions();
  }, []);

  const handleRestore = async (id) => {
    try {
      const response = await fetch(`http://localhost:3001/submissions/${id}/restore`, {
        method: "PATCH",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Restore failed");
      }

      toast.success("Submission restored to pending!", {
        position: "top-right",
        autoClose: 3000,
      });

      // Optionally refresh submissions after restoring
      setSubmissions((prev) =>
        prev.map((submission) =>
          submission._id === id ? { ...submission, status: "pending" } : submission
        )
      );
    } catch (error) {
      console.error("Error restoring submission:", error);
      toast.error("Restore failed: " + error.message, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="container py-4" style={{ position: "relative" }}>
      <ToastContainer />
      <h2 className="mb-4 text-center">All Submissions</h2>
      {submissions.length === 0 ? (
        <p>Loading submissions...</p>
      ) : (
        <div className="submissions-scroll-container">
          <div className="submissions-list">
            {submissions.map((submission, index) => (
              <div className="view-submission-card" key={index}>
                {submission.image && (
                  <img
                    className="view-card-image"
                    src={`http://localhost:3001/image/${submission._id}`}
                    alt={submission.title}
                  />
                )}
                <div className="card-content">
                  <div className="category">{submission.category}</div>
                  <div className="heading">{submission.title}</div>
                  <div className="description">{submission.description}</div>
                  <div className="author">
                    By <span className="name">{submission.author}</span> |{" "}
                    {new Date(submission.entryDate).toLocaleDateString()} |{" "}
                    <strong>Status: {submission.status}</strong>
                  </div>
                  {(submission.status === "approved" || submission.status === "declined") && (
                    <div className="action-button-container">
                      <button
                        className="restore-button"
                        onClick={() => handleRestore(submission._id)}
                      >
                        Restore to Pending
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <button className="btn btn-secondary mt-3" onClick={() => navigate("/profile")}>
        Back to Profile
      </button>
    </div>
  );
}

export default ViewAllSubmissions;
