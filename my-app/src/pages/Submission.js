import React, { useState } from "react";
import "../styles/Submission.css";

function Submission() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [image, setImage] = useState(null);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!title.trim() || !description.trim()) {
      setMessage("Both fields are required.");
      return;
    }

    const submissionData = { title, description, image};
    console.log("Submission Data:", submissionData);

    setMessage(`Submission Successful!`);
    setTitle("");
    setDescription("");
    setImage(null);
    
  };

  const handleImageInput = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  return (
    <div className="contact-form-container"> 
      <div className="contact-form">
        <h2 className="heading">Tournament Submission</h2>
        <h3 className="subheading">Submit your creative ideas here!</h3>
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

          <label>Upload an Image:</label>
          <input type="file" accept="image/" onChange={handleImageInput} />

          <button type="submit">Submit</button>
        </form>
        {message && <p className="submission-message">{message}</p>}
      </div>
    </div>
  );
}

export default Submission;
