import React from "react";
import "../styles/Home.css";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Books from "../assets/books.png";
import Podium from "../components/Podium";
import Footer from "../components/Footer";

function Home({ submissions = [] }) {
  return (
    <div className="home-background d-flex flex-column min-vh-100">
      {/* Header Section */}
      <div className="container-fluid flex-grow-1">
        <div className="row justify-content-center pt-5">
          <div className="col-xl-5 col-lg-6 col-md-8 col-sm-10 mt-5">
            <div className="header-wrapper position-relative">
              <div className="bg-secondary bg-opacity-25 p-4 p-md-5 mt-5 mb-5 header-container">
                <h1 className="text-center mb-4 mb-md-5">
                  Join the Tournament!
                </h1>
                <p className="mx-2 mx-md-4 mb-4 mb-md-5 header-paragraph">
                  Got an idea for a STEM topic that could be turned into a
                  children's book? Submit your idea today! Or check out our
                  upcoming and currently-running tournaments.
                </p>
                <div className="mx-2 mx-md-4 button-container">
                  <Link to="/tournament">
                    <button className="btn btn-secondary button-one">
                      View Tournament
                    </button>
                  </Link>
                  <Link to="/submission">
                    <button className="btn btn-secondary button-two">
                      Submit Idea
                    </button>
                  </Link>
                </div>
              </div>
              <div className="circle-container d-none d-md-block">
                <img
                  src={Books}
                  alt="Chris Ferrie's Books"
                  className="book-image"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Podium Section */}
      <div className="container-fluid">
        <Podium submissions={submissions} />
      </div>

      {/* Footer Section */}
      <Footer />
    </div>
  );
}

export default Home;
