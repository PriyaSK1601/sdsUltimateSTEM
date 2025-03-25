import { useState } from "react";
import "./App.css";
import Navbar from "./components/Navbar";
import Submission from "./pages/Submission";
import Tournament from "./pages/Tournament"; 
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

function App() {

  //Store submissions here
  const [submissions, setSubmissions] = useState([]);
  const handleNewSubmission = (submissionData) => {
    setSubmissions((prev) => [...prev, submissionData]);
  }

  return (
    <div className="App">
      <Router>
        <Navbar />
        <Routes>
          <Route path="/submission" element={<Submission onSubmit={handleNewSubmission} />} />
          <Route path="/tournament" element={<Tournament submissions={submissions}/>}/>
        </Routes>
      </Router>
    </div>
  );
}

export default App;

