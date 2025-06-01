import { useState, useEffect } from "react";
import "./App.css";
import Navbar from "./components/Navbar";
import Profile from "./pages/profile";
import Login from "./pages/login";
import SignUp from "./pages/register";
import Home from "./pages/Home";
import Submission from "./pages/Submission";
import Tournament from "./pages/Tournament";
import ForgotPass from "./pages/forgotPass";
import AdminLogin from "./pages/adminLogin";
import EditCountdown from "./pages/EditCountdown";
import ViewAllSubmissions from "./pages/ViewAllSubmissions";

import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { auth } from "./pages/firebase";

function App() {
  const [user, setUser] = useState();
  
  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      setUser(user);
    });
  }, []);

  const [submissions, setSubmissions] = useState([]);
  const handleNewSubmission = (submissionData) => {
    setSubmissions((prev) => [...prev, submissionData]);
  };

  return (
    <div className="App">
      <ToastContainer />
      <div className="auth-wrapper">
        <div className="auth-inner">
          <Router>
            <Navbar />
            <Routes>
              <Route path="/" exact element={<Home submissions={submissions} />} />
              <Route path="/home" exact element={<Home submissions={submissions} />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<SignUp />} />
              <Route path="/forgotPass" element={<ForgotPass />} />
              <Route path="/adminLogin" element={<AdminLogin />} />
              <Route path="/submission" element={<Submission onSubmit={handleNewSubmission} />} />
              <Route path="/tournament" element={<Tournament submissions={submissions} />} />
              <Route path="/edit-countdown" element={<EditCountdown />} />
              <Route path="/viewAllSubmissions" element={<ViewAllSubmissions />} />
            </Routes>
          </Router>
        </div>
      </div>
    </div>
  );
}

export default App;
