import "./App.css";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
//import Dashboard from "./pages/Dashboard";
//import Announcement from "./components/Announcement";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

function App() {
  return (
    <div className="App">
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" exact element={<Home />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;

//hey testing
//hiiiii
