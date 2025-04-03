import "./App.css";
import Navbar from "./components/Navbar";
import Profile from "./pages/profile";
import Login from "./pages/login";
import SignUp from "./pages/register";
import Home from "./pages/Home";
import ForgotPass from "./pages/forgotPass";
import AdminLogin from "./pages/adminLogin";

import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
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
  });
  return (
    <div className="App">

      <div className="auth-wrapper">
        <div className="auth-inner">
          <Router>
            <Navbar />
            <ToastContainer />
            <Routes>
              <Route
                    path="/"
                    element={user ? <Navigate to="/profile" /> : <Login />}
              />
              <Route
                    path="/"
                    element={user ? <Navigate to="/profile" /> : <AdminLogin />}
              />
              <Route path="/" exact element={<Home />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<SignUp />} />
              <Route path= "/forgotPass" element={<ForgotPass />}/>
              <Route path="/adminLogin" element={<AdminLogin />} />
              <Route 
    // path="/admin-profile" 
    // element={
    //   user ? <AdminProfile /> : <Navigate to="/admin-login" />
    // } 
  />
            </Routes>
          </Router>
        </div>
      </div>
    </div>
  );
}

export default App;
