import React from "react";
import "../styles/Footer.css";
import link from "../assets/link_icon.png";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <div className="footer">
      <div className="leftSide">
        <h1>For more information, visit: </h1>
      </div>
      <div className="rightSide">
        <img src={link} alt="Link icon" />
        <h1>
          <a href="https://www.csferrie.com/" target="_blank">
            Chris Ferrie
          </a>
        </h1>
      </div>
    </div>
  );
}
export default Footer;
