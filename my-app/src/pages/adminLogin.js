import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { auth } from "./firebase";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/login.css"; 

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (email !== "admin@gmail.com") {
      toast.error("Only admin@gmail.com can access this page.", {
        position: "top-center",
        autoClose: 3000,
      });
      return; 
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      

      toast.success("Admin login successful! Redirecting...", {
        position: "top-center",
        autoClose: 2000,
      });

      setTimeout(() => {
        window.location.href = "/profile"; 
      }, 2000);

    } catch (error) {
      console.error("Login error:", error);


      if (error.code === "auth/wrong-password") {
        toast.error("🔒 Incorrect password. Try again.", {
          position: "top-center",
        });
      } else {
        toast.error(`${error.message}`, {
          position: "top-center",
        });
      }
    }
  };

  return (
    <div className="login-container">
      <ToastContainer />
      <form className="login-form" onSubmit={handleSubmit}>
        <h3>Admin Login</h3>

        <div className="input-group">
          <label>Email address</label>
          <input
            type="email"
            className="input-field"
            placeholder="Enter admin email"
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
          Regular user? <a href="/login" className="link">User Login Here</a>
        </p>
      </form>
    </div>
  );
}

export default AdminLogin;