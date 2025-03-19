import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/signup.css"; 

function Signup() {
  const navigate = useNavigate();

  return (
    <div className="signup-container">
      <h2>Signup Page</h2>
      <input type="text" placeholder="Full Name" className="input-field" />
      <input type="email" placeholder="Email" className="input-field" />
      <input type="password" placeholder="Password" className="input-field" />
      <button className="auth-btn">Sign Up</button>
      <p>Already have an account? <span className="link" onClick={() => navigate("/login")}>Login</span></p>
    </div>
  );
}

export default Signup;
