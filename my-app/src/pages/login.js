import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { auth } from "./firebase";
import { toast } from "react-toastify";
import SignInwithGoogle from "./signInWIthGoogle";
import "../styles/login.css"; 

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("User logged in Successfully");
      toast.success("User logged in Successfully", { position: "top-center" });
      setTimeout(() => {
        window.location.href = "/profile";
      }, 1500);
    } catch (error) {
      console.log(error.code, error.message);

      // Custom error messages based on Firebase error codes
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
        </p>

        <SignInwithGoogle />
      </form>
    </div>
  );
}

export default Login;



