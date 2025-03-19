import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css"; 

function Login() {
  const navigate = useNavigate();

  return (
    <div className="login-container">
      <h2>Login Page</h2>
      <input type="email" placeholder="Email" className="input-field" />
      <input type="password" placeholder="Password" className="input-field" />
      <button className="auth-btn">Login</button>
      <p>Don't have an account? <span className="link" onClick={() => navigate("/signup")}>Sign up</span></p>
    </div>
  );
}

export default Login;
