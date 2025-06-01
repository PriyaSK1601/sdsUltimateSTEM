import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/ViewAllSubmissions.css";
import "bootstrap/dist/css/bootstrap.min.css";

function ViewAllSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const navigate = useNavigate();
  const [editedSubmission, setEditedSubmission] = useState({});
  const [isEditing, setIsEditing] = useState(false);


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

      toast.success("Submission restored to pending!");

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

  const resetVotesForSubmission = async (submissionId) => {
  try {
    const res = await fetch(`http://localhost:3001/submissions/${submissionId}/reset-votes`, {
      method: "PATCH",
    });
    if (!res.ok) throw new Error("Failed to reset");
    alert("Votes reset for that submission.");
  } catch (e) {
    console.error(e);
    alert("Failed to reset votes.");
  }
};

const handleDelete = async (id) => {
  try {
    const response = await fetch(`http://localhost:3001/submissions/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete submission");
    }

    toast.success("Submission deleted successfully!", {
      position: "top-right",
      autoClose: 3000,
    });

    // Remove from local list
    setSubmissions((prev) => prev.filter((submission) => submission._id !== id));
  } catch (error) {
    console.error("Delete error:", error);
    toast.error("Error deleting submission: " + error.message, {
      position: "top-right",
      autoClose: 3000,
    });
  }
};

   const handleEditClick = (submission) => {
    setIsEditing(true);
    setEditedSubmission({ ...submission });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedSubmission((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSave = async () => {
    if (!editedSubmission) return;
    try {
      const res = await fetch(`http://localhost:3001/submissions/${editedSubmission._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedSubmission),
      });
      if (!res.ok) throw new Error("Failed to save edits");

      toast.success("Submission updated!");
      setSubmissions((prev) =>
        prev.map((sub) =>
          sub._id === editedSubmission._id ? { ...sub, ...editedSubmission } : sub
        )
      );
      setIsEditing(false);
      setEditedSubmission(null);
    } catch (err) {
      toast.error("Edit failed: " + err.message);
    }
  };

  return (
    <div className="container py-4">
      <ToastContainer />
      <h2 className="mb-4">Manage Submissions</h2>
      {submissions.length === 0 ? (
        <p>Loading submissions...</p>
      ) : (
        <div className="submissions-scroll-container">
          <div className="submissions-list">
            {submissions.map((submission) => (
              <div className="view-submission-card-all">
              <div className="card-content" key={submission._id}>
                 {submission.image && (
                  <img
                    className="view-card-image"
                    src={`http://localhost:3001/image/${submission._id}`}
                    alt={submission.title}
                  />
                )}
                <div className="category">
                  {isEditing && editedSubmission?._id === submission._id ? (
                    <input
                      name="category"
                      value={editedSubmission.category}
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  ) : (
                    submission.category
                  )}
                </div>

                <div className="heading">
                  {isEditing && editedSubmission?._id === submission._id ? (
                    <input
                      name="title"
                      value={editedSubmission.title}
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  ) : (
                    submission.title
                  )}
                </div>

                <div className="description">
                  {isEditing && editedSubmission?._id === submission._id ? (
                    <textarea
                      name="description"
                      value={editedSubmission.description}
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  ) : (
                    submission.description
                  )}
                </div>

                <div className="author">
                  By <span className="name">{submission.author}</span> |{" "}
                  {new Date(submission.entryDate).toLocaleDateString()} |{" "}
                  <strong>Status: {submission.status}</strong>
                </div>

                {isEditing && editedSubmission?._id === submission._id ? (
                  <button
                    className="btn btn-success btn-sm mt-2"
                    onClick={handleEditSave}
                  >
                    Save
                  </button>
                ) : (
                  <button
                    className="btn btn-warning btn-sm mt-2"
                    onClick={() => handleEditClick(submission)}
                  >
                    Edit
                  </button>
                )}

                {(submission.status === "approved" || submission.status === "declined") && (
                  <div className="action-button-container">
                    <button
                      className="restore-button"
                      onClick={() => handleRestore(submission._id)}
                    >
                      Restore to Pending
                    </button>
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => resetVotesForSubmission(submission._id)}
                    >
                      Reset Votes
                    </button>
                    <button
                      className="btn btn-danger w-100"
                      onClick={() => handleDelete(submission._id)}
                    >
                      Delete
                    </button>
                    </div>
                )}</div>
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
