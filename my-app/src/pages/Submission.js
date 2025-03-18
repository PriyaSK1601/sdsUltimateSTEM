import React, { useState } from "react";
import "../styles/Submission.css";

function Submission() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!title.trim() || !description.trim()) {
      setMessage("Both fields are required.");
      return;
    }

    const submissionData = { title, description };
    console.log("Submission Data:", submissionData);

    setMessage(`"${title}" has been submitted!`);
    setTitle("");
    setDescription("");
  };

  return (
    <div className="contact-form-container"> 
      <div className="contact-form">
        <h2 className="heading">Submit Your Entry</h2>
        <form onSubmit={handleSubmit}>
          <label>Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter title"
            required
          />

          <label>Description:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter description"
            required
          ></textarea>

          <button type="submit">Submit</button>
        </form>
        {message && <p className="submission-message">{message}</p>}
      </div>
    </div>
  );
}

export default Submission;
