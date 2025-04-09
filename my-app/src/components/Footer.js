import React from "react";
import "../styles/Footer.css";
import link from "../assets/link_icon.png";

function Footer() {
  return (
    <div className="footer py-4 position-absolute w-100">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-md-6 text-md-end">
            <h1 className="mb-0">For more information, visit: </h1>
          </div>
          <div className="col-md-6 text-md-start">
            <h1 className="mb-0">
              <img src={link} alt="Link icon" className="mx-3" />
              <a
                href="https://www.csferrie.com/"
                target="_blank"
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
