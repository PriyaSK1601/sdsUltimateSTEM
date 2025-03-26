import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/profile.css";
import { auth } from "./firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";

function Profile() {
  const [user, setUser] = useState(null); 
  const navigate = useNavigate(); 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null); 
      }
    });

    return () => {
      
      unsubscribe();
    };
  }, []);

  const handleLogout = () => {
    signOut(auth).then(() => {
      navigate("/login"); 
    });
  };

  return (
    <div className="profile-container">
      <h2>Profile Page</h2>
      {user ? (
        <div>
          <p>Welcome, {user.displayName || user.email}</p>
          <p>Email: {user.email}</p>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      ) : (
        <div>
          <p>Please log in to view your profile.</p>
          <button className="login-signup-btn" onClick={() => navigate("/login")}>
            Login / Signup
          </button>
        </div>
      )}
    </div>
  );
}

export default Profile;
