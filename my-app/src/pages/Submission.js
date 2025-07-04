import "bootstrap/dist/css/bootstrap.min.css";
import React, { useEffect, useRef, useState } from "react";
import UploadIcon from "../assets/upload.png";
import UploadedIcon from "../assets/uploaded.png";
import '../styles/Submission.css';
import axios from "axios";
import { auth , db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


function Submission({ onSubmit }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [image, setImage] = useState(null);
  const [author, setAuthor] = useState("Anonymous");
  const navigate = useNavigate();
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const fullName = user.displayName 
          ? capitalizeFirstLetter(user.displayName) 
          : capitalizeFirstLetter(user.email.split("@")[0]);
        setAuthor(fullName);
      }
    });
    return () => unsubscribe();
  }, []);

  const capitalizeFirstLetter = (string) => {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  const axiosPostData = async () => {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("author", author); 
    if (image) {
      formData.append("image", image);
    }
  
    try {
      await axios.post('http://localhost:3001/contact', formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        }
      });
    } catch (e) {
      setMessage("Error submitting form, try again!")
    }
  };
  
  const handleSubmit = async (event) => {
    event.preventDefault();
  
    if (!title.trim() || !description.trim() || !category) {
      setMessage("All fields are required.");
      return;
    }
  
    await axiosPostData();  

    setTitle("");
    setDescription("");
    setCategory("");
    setImage(null);
    
    toast.success("Submission successful!", { position: "top-center" });

    setTimeout(() => {
      navigate("/tournament");
    }, 2000); 
    

  };


  const handleImageInput = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  return (
    <div className="bg">
    <div className="container-submission">
      <div className="submission-header">
        <h2>Tournament Submission</h2>
        <h5>Submit your creative ideas here!</h5>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title:</label>
          <input
            type="text"
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter title"
            required
          />
        </div>
        <div className="form-group">
          <label>Description:</label>
          <textarea
            className="form-control form-control-textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter description"
            required
          ></textarea>
        </div>
        <div className="category-upload-container">
          <select
            className="form-control category-dropdown"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">STEM Category</option>
            <option value="Science">Science</option>
            <option value="Technology">Technology</option>
            <option value="Engineering">Engineering</option>
            <option value="Mathematics">Mathematics</option>
          </select>
          <div className="upload-container" onClick={() => fileInputRef.current.click()}>
            <span className="upload-label">Image upload (optional)</span>
            <img src={image ? UploadedIcon : UploadIcon} alt="Upload Icon" />
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageInput}
          className="d-none"
        />
        <button type="submit" className="btn btn-dark">Submit</button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
    </div>
  );
}

export default Submission;

//<a href="https://www.flaticon.com/free-icons/file-upload" title="file upload icons">File upload icons created by Creatype - Flaticon</a>