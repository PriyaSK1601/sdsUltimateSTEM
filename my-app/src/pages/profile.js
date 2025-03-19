import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/profile.css";
import { auth } from "./firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";

function Profile() {
  const [user, setUser] = useState(null); // Track user data
  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser); // Set the user data if logged in
      } else {
        setUser(null); // Set user to null if logged out
      }
    });

    return () => {
      // Clean up the listener on unmount
      unsubscribe();
    };
  }, []);

  const handleLogout = () => {
    signOut(auth).then(() => {
      navigate("/login"); // Navigate to login after logout
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
