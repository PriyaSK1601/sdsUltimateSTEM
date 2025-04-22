import { sendPasswordResetEmail } from "firebase/auth";
import React from "react";
import { auth } from "../pages/firebase";
import "../styles/forgotPass.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function ForgotPass() {
  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailVal = e.target.email.value;

    sendPasswordResetEmail(auth, emailVal)
      .then(() => {
        toast.success("If this email is registered, a reset link has been sent.", {
          position: "top-center",
        });
      })
      .catch((err) => {
        if (err.code === "auth/invalid-email") {
          toast.error("Please enter a valid email address.", {
            position: "top-center",
          });
        } else {
          toast.error("Something went wrong: " + err.message, {
            position: "top-center",
          });
        }
      });
  };

  return (
    <div className="forgot-container">
      <ToastContainer />
      <div className="forgot-box">
        <h1 className="forgot-title">Forgot Password</h1>
        <form className="forgot-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              name="email"
              type="email"
              required
              placeholder="Enter your email"
              className="input-field"
            />
          </div>
          <button type="submit" className="auth-btn">Reset</button>
        </form>
        <a href="/login" className="back-link">Back to Login</a>
      </div>
    </div>
  );
}

export default ForgotPass;


