import React, { useEffect, useState } from "react";
import ProfileIcon from "../assets/profile_icon.png";
import BulbLogo from "../assets/bulb.png";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../pages/firebase";
import { onAuthStateChanged } from "firebase/auth";
import "../styles/Navbar.css";

function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const [isExpanded, setIsExpanded] = useState(false);
  const toggleNavbar = () => {
    setIsExpanded(!isExpanded);
  };

  const [isSmScreen, setIsSmScreen] = useState(false); //to make sure profile link in collapsed menu only shows when window is resized to a small screen (576px).
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmScreen(window.innerWidth < 576);
    };

    checkScreenSize();

    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

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
    <nav className="navbar navbar-dark navbar-expand-sm">
      <span className="navbar-brand ms-4 d-inline-block">
        <img src={BulbLogo} alt="Bulb Logo" />
      </span>
      <button
        type="button"
        className="navbar-toggler mx-4"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
        onClick={toggleNavbar}
      >
        <span className="navbar-toggler-icon"></span>
      </button>
      <div
        className={`collapse navbar-collapse justify-content-end ${
          isExpanded ? "show" : ""
        }`}
        id="navbarNav"
      >
        <ul className="navbar-nav align-items-center">
          <li className="nav-item active mx-4 nav-item-border">
            <Link to="/home" className="nav-link">
              Home
            </Link>
          </li>
          <li className="nav-item active mx-4 nav-item-border">
            <Link to="/tournament" className="nav-link">
              Tournament
            </Link>
          </li>
          <li className="nav-item active mx-4 nav-item-border">
            <Link to="/submission" className="nav-link">
              Submission
            </Link>
          </li>
          <li className="nav-item active mx-4 nav-item-border">
            <a
              href="/profile"
              className="nav-link"
              onClick={handleProfileClick}
            >
              {isExpanded && isSmScreen ? (
                "Profile"
              ) : (
                <img src={ProfileIcon} alt="Profile Icon" />
              )}
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
