import "./App.css";
import Navbar from "./components/Navbar";
import Profile from "./pages/profile";
import Login from "./pages/login";
import SignUp from "./pages/register"; 
import Home from "./pages/Home";

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import React, { useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useState } from "react";
import { auth } from "./pages/firebase";
import { Navigate } from "react-router-dom";





function App() {
  const [user, setUser] = useState();
  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      setUser(user);
    });
  });
  return (
    <div className="App">

      <div className="auth-wrapper">
        <div className="auth-inner">
          <Router>
            <Navbar />
            <Routes>
              <Route
                    path="/"
                    element={user ? <Navigate to="/profile" /> : <Login />}
              />
              <Route path="/" exact element={<Home />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<SignUp />} />
            </Routes>
          </Router>
        </div>
      </div>
    </div>
  );
}

export default App;

