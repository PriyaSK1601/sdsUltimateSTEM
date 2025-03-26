import React from "react";
import "../styles/Home.css";
import { Link } from "react-router-dom";
import Book from "../assets/bookIdea.png";
import background from "../assets/home.webp";
import Podium from "../components/Podium";
import Footer from "../components/Footer";

function Home() {
  return (
    <div
      className="home"
      style={{
        backgroundImage: `URL(${background})`,
      }}
    >
      <div className="circle">
        <img src={Book} alt="Book with lightbulb" />
      </div>
      <div className="headerContainer">
        <h1>Join the tournament!</h1>
        <p>
          Got an idea? Submit your idea today! Or check out our upcoming and
          currently-running tournaments.
        </p>
        <Link to="/tournament">
          <button className="headerContainerButton1"> View Tournament </button>
        </Link>
        <Link to="/submission">
          <button className="headerContainerButton2"> Submit Idea </button>
        </Link>
      </div>
      <Podium />
      <Footer />
    </div>
  );
}
export default Home;
