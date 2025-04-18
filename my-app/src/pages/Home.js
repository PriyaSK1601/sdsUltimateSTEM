import React from "react";
import "../styles/Home.css";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Books from "../assets/books.png";
import Podium from "../components/Podium";
import Footer from "../components/Footer";

function Home({ submissions = [] }) {
  return (
    <div className="container-fluid p-0 home-background">
      <div className="row h-100 justify-content-center pt-5">
        <div className="col-md-6 mt-5">
          <div className="bg-secondary bg-opacity-25 p-5 mt-5 header-container">
            <h1 className="text-center mb-5">Join the Tournament!</h1>
            <p className="mx-4 mb-5 header-paragraph">
              Got an idea for a STEM topic that could be turned into a
              children's book? Submit your idea today! Or check out our upcoming
              and currently-running tournaments.
            </p>
            <div className="justify-content-left mx-4 button-container">
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
          <div className="rounded-circle bg-secondary bg-opacity-50 position-relative circle-container">
            <img
              src={Books}
              alt="Chris Ferrie's Books"
              className="position-absolute book-image"
            />
          </div>
        </div>
      </div>
      <Podium submissions={submissions} />
      <Footer />
    </div>
  );
}

export default Home;
