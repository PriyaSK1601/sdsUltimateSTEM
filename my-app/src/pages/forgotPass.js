import { sendPasswordResetEmail, fetchSignInMethodsForEmail } from "firebase/auth";
import React from "react";
import { auth } from "./firebase"; 
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/forgotPass.css";

function ForgotPass() {
    const history = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const emailVal = e.target.email.value;

        try {
            // First check if email exists
            const methods = await fetchSignInMethodsForEmail(auth, emailVal);
            
            if (methods.length === 0) {
                // No account with this email exists
                toast.error("No account found with this email address.", { 
                    position: "top-center",
                    autoClose: 5000
                });
                return;
            }

            // If email exists, send reset email
            await sendPasswordResetEmail(auth, emailVal);
            toast.success("Password reset email sent. Please check your inbox.", { 
                position: "top-center",
                autoClose: 3000
            });
            setTimeout(() => {
                history("/");
            }, 3000);
            
        } catch (err) {
            console.log(err.code);
            switch(err.code) {
                case "auth/invalid-email":
                    toast.error("Invalid email format. Please enter a valid email.", { 
                        position: "top-center",
                        autoClose: 5000
                    });
                    break;
                case "auth/too-many-requests":
                    toast.error("Too many attempts. Please try again later.", { 
                        position: "top-center",
                        autoClose: 5000
                    });
                    break;
                default:
                    toast.error("Failed to send reset email. Please try again.", { 
                        position: "top-center",
                        autoClose: 5000
                    });
            }
        }
    };

    return (
        <div className="forgot-container"> 
            <ToastContainer />
            <div className="forgot-box">
                <h1 className="forgot-title">Forgot Password</h1>
                <form className="forgot-form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Email address</label>
                        <input 
                            className="input-field" 
                            name="email" 
                            type="email" 
                            placeholder="Enter your email" 
                            required 
                        />
                    </div>
                    <button className="auth-btn" type="submit">Reset Password</button>
                </form>
                <a className="back-link" href="/">Back to Login</a>
            </div>
        </div>
    );
}

export default ForgotPass;
