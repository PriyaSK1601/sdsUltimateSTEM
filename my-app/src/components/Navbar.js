import React, { useEffect, useState } from "react";
import Logo from "../assets/logo.png";
import ProfileIcon from "../assets/profile_icon.png";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../pages/firebase";
import { onAuthStateChanged } from "firebase/auth";
import "../styles/Navbar.css";

function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const handleProfileClick = (e) => {
    e.preventDefault();
    if (user) {
      navigate("/profile");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="navbar">
      <div className="leftSide">
        <img src={Logo} alt="Lightbulb logo" />
      </div>
      <div className="rightSide">
        <Link to="/home"> Home </Link>
        <Link to="/dashboard"> Dashboard </Link>
        <Link to="/tournament"> Tournament </Link>
        <Link to="/submission"> Submission </Link>
        <a href="#" onClick={handleProfileClick}>
          <img src={ProfileIcon} alt="Profile Icon" />
        </a>
      </div>
    </div>
  );
}

export default Navbar;
