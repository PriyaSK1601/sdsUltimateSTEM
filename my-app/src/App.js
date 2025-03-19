import "./App.css";
import Navbar from "./components/Navbar";
import Profile from "./pages/profile";
import Login from "./pages/login";
import Signup from "./pages/signup"; 
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";


function App() {
  return (
    <div className="App">
      <Router>
        <Navbar />
        <Routes>
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;

