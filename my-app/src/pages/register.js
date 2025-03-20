import { createUserWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { auth, db } from "./firebase";
import { setDoc, doc } from "firebase/firestore";
import { toast } from "react-toastify";
import "../styles/register.css"; // Import the CSS file

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      const user = auth.currentUser;
      if (user) {
        await setDoc(doc(db, "Users", user.uid), {
          email: user.email,
          firstName: fname,
          lastName: lname,
          photo: "",
        });
      }
      console.log("User Registered Successfully!!");
      toast.success("User Registered Successfully!!", {
        position: "top-center",
      });
      window.location.href = "/profile"; // Redirect after successful registration
    } catch (error) {
      console.log(error.message);
      toast.error(error.message, {
        position: "bottom-center",
      });
    }
  };

  return (
    <div className="signup-container">
      <form className="signup-form" onSubmit={handleRegister}>
        <h3>Sign Up</h3>

        <div className="input-group">
          <label>First Name</label>
          <input
            type="text"
            className="input-field"
            placeholder="First name"
            value={fname}
            onChange={(e) => setFname(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label>Last Name</label>
          <input
            type="text"
            className="input-field"
            placeholder="Last name"
            value={lname}
            onChange={(e) => setLname(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label>Email Address</label>
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

        <button type="submit" className="auth-btn">Sign Up</button>

        <p className="already-registered">
          Already registered? <a href="/login" className="link">Login</a>
        </p>
      </form>
    </div>
  );
}

export default Register;

