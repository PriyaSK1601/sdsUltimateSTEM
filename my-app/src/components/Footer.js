import React from "react";
import "../styles/Footer.css";
import link from "../assets/link_icon.png";

function Footer() {
  return (
    <div className="footer py-4 mt-auto">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-md-6 text-center text-md-end mb-2 mb-md-0">
            <h1 className="mb-0 footer-text">For more information, visit: </h1>
          </div>
          <div className="col-md-6 text-center text-md-start">
            <h1 className="mb-0 footer-text">
              <img src={link} alt="Link icon" className="mx-2" />
              <a
                href="https://www.csferrie.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-link"
              >
                Chris Ferrie
              </a>
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Footer;
