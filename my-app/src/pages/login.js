import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { auth } from "./firebase";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/login.css"; 
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const history = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (email === "admin@gmail.com") {
      toast.error("Admin must login through the Admin Login page.", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("User logged in Successfully", { position: "top-center" });
      setTimeout(() => {
        window.location.href = "/profile";
      }, 2000);
    } catch (error) {
      console.log(error.code, error.message);

      if (error.code === "auth/wrong-password") {
        toast.error("Incorrect password. Please try again.", { position: "top-center" });
      } else if (error.code === "auth/user-not-found") {
        toast.error("No user found with this email. Please register first.", { position: "top-center" });
      } else if (error.code === "auth/invalid-email") {
        toast.error("Invalid email format. Please check again.", { position: "top-center" });
      } else {
        toast.error(error.message, { position: "bottom-center" });
      }
    }
  };

  return (
    <div className="login-container">
      <ToastContainer />
      <form className="login-form" onSubmit={handleSubmit}>
        <h3>Login</h3>

        <div className="input-group">
          <label>Email address</label>
          <input
            type="email"
            className="input-field"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label>Password</label>
          <input
            type="password"
            className="input-field"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="auth-btn">Login</button>

        <p className="forgot-password">
          New user? <a href="/register" className="link">Register Here</a>
          <br />
          Admin? <a href="/adminLogin" className="link">Admin Login Here</a>
        </p>

        <p className="forgotPass">
          <a href="/forgotPass" className="link">Forgot Password?</a>

        </p>
      </form>
    </div>
  );
}

export default Login;



