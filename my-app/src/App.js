import "./App.css";
import Navbar from "./components/Navbar";
import Submission from "./pages/Submission";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

function App() {
  return (
    <div className="App">
      <Router>
        <Navbar />
        <Routes>
          {/* Define the Submission page route */}
          <Route path="/submission" element={<Submission />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;


//hey testing
//hiiiii
