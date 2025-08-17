import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthPage from "./components/auth-page";
import Dashboard from "./components/Dashboard";
import Summarizar from "./components/summarizar";
import Chatbot from "./components/chatbot";
import Quiz from "./components/quiz";
import Flashcard from "./components/flashcard";
import Signup from "./components/signup";

function App() {
  return (
    
    
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/Summarizar" element={<Summarizar />} /> 
        <Route path="/Chatbot" element={<Chatbot />} /> 
        <Route path="/Quiz" element={<Quiz />} /> 
        <Route path="/Flashcard" element={<Flashcard />} /> 


        {/* Add more routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;