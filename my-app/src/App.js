import { useState } from "react";
import "./App.css";
import Navbar from "./components/Navbar";

import Profile from "./pages/profile";
import Login from "./pages/login";
import SignUp from "./pages/register";
import Home from "./pages/Home";
import Submission from "./pages/Submission";
import Tournament from "./pages/Tournament";
import ForgotPass from "./pages/forgotPass"
import AdminLogin from "./pages/adminLogin"



import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import React, { useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { auth } from "./pages/firebase";
import { Navigate } from "react-router-dom";

//Changed

function App() {
  const [user, setUser] = useState();
  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      setUser(user);
    });
  });

  //Store submissions here
  const [submissions, setSubmissions] = useState([]);
  const handleNewSubmission = (submissionData) => {
    setSubmissions((prev) => [...prev, submissionData]);
  };

  return (
    <div className="App">
      <div className="auth-wrapper">
        <div className="auth-inner">
          <Router>
            <Navbar />
            <Routes>
              <Route
                path="/"
                exact
                element={<Home submissions={submissions} />}
              />
              <Route
                path="/home"
                exact
                element={<Home submissions={submissions} />}
              />
              <Route path="/profile" element={<Profile />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<SignUp />} />
              <Route path="/forgotPass" element={<ForgotPass/>} />
              <Route path="/adminLogin" element={<AdminLogin />} />
              <Route
                path="/submission"
                element={<Submission onSubmit={handleNewSubmission} />}
              />
              <Route
                path="/tournament"
                element={<Tournament submissions={submissions} />}
              />
            </Routes>
          </Router>
        </div>
      </div>
    </div>
  );
}
{
  /*<Route
                    path="/"
                    element={user ? <Navigate to="/profile" /> : <Login />}
              />*/
}

export default App;
