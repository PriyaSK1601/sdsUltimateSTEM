import React from "react";
import Logo from "../assets/logo.png";
import ProfileIcon from "../assets/profile_icon.png";
import { Link } from "react-router-dom";
import "../styles/Navbar.css";

function Navbar() {
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
        <Link to="/profile">
          <img src={ProfileIcon} alt="Profile Icon" />
        </Link>
      </div>
    </div>
  );
}

export default Navbar;
