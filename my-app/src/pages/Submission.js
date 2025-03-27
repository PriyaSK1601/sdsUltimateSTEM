import React, { useState, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
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

    const submissionData = {
      title,
      description,
      category,
      image: image ? URL.createObjectURL(image) : null,
    };
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
    <div className="container d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card p-4 shadow-lg" style={{ maxWidth: "500px", width: "100%" }}>
        <h2 className="text-center">Tournament Submission</h2>
        <h5 className="text-center text-muted mb-4">Submit your creative ideas here!</h5>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Title:</label>
            <input
              type="text"
              className="form-control"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter title"
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Description:</label>
            <textarea
              className="form-control"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description"
              required
            ></textarea>
          </div>
          <div className="mb-3">
            <label className="form-label">Category:</label>
            <select
              className="form-select"
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
          </div>
          <div className="mb-3 text-center">
            <label className="form-label d-block">Image Upload (optional):</label>
            <div
              className="border rounded p-3 d-inline-block"
              onClick={() => fileInputRef.current.click()}
              style={{ cursor: "pointer" }}
            >
              {image ? (
                <img src={UploadedIcon} alt="Uploaded Icon" width={40} />
              ) : (
                <img src={UploadIcon} alt="Upload Icon" width={40} />
              )}
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageInput}
            className="d-none"
          />
          <div className="text-center">
            <button type="submit" className="btn btn-dark">Submit</button>
          </div>
        </form>
        {message && <p className="text-center text-success mt-3">{message}</p>}
      </div>
    </div>
  );
}

export default Submission;
