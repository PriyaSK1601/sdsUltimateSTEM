import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/profile.css"; 

function Profile() {
  const navigate = useNavigate(); // Hook for navigation

  return (
    <div className="profile-container">
      <h2>Profile Page</h2>
      <button className="login-signup-btn" onClick={() => navigate("/login")}>
        Login / Signup
      </button>
    </div>
  );
}

export default Profile;
