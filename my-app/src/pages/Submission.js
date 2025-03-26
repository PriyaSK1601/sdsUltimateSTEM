import React, { useState, useRef } from "react";
import "../styles/Submission.css";
import UploadIcon from "../assets/upload.png";
import UploadedIcon from "../assets/uploaded.png";

function Submission({ onSubmit }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [image, setImage] = useState(null);
  const fileInputRef = useRef(null);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!title.trim() || !description.trim() || !category) {
      setMessage("All fields are required.");
      return;
    }

    const submissionData = { title, description, category, image: image ? URL.createObjectURL(image) : null };
    onSubmit(submissionData);

    setMessage("Submission Successful!");
    setTitle("");
    setDescription("");
    setCategory("");
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

          <div className="form-row">
            <select
              className="dropdown-menu"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="">Select Category</option>
              <option value="Science">Science</option>
              <option value="Technology">Technology</option>
              <option value="Engineering">Engineering</option>
              <option value="Mathematics">Mathematics</option>
            </select>

            <div className="upload-section">
              <label>Image upload (optional):</label>
              <div className="image-upload-container" onClick={() => fileInputRef.current.click()}>
                { image ? (
                  <img src={UploadedIcon} alt="Uploaded Icon" className="upload-icon" />
                ) : (
                  <img src={UploadIcon} alt="Upload Icon" className="upload-icon" />
                )}
              </div>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageInput}
            style={{ display: "none" }}
          />

          <button type="submit">Submit</button>
        </form>
        {message && <p className="submission-message">{message}</p>}
      </div>
    </div>
  );
}

export default Submission;
