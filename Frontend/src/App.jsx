import { Routes, Route } from "react-router-dom";

import Home from "./Pages/Home/Home";
import Login from "./Pages/Login/Login";
import Register from "./Pages/Register/Register";
import Dashboard from "./Pages/Dashboard/Dashboard";
import Interview from "./Pages/Interview/Interview";
import Report from "./Pages/Report/Report";
import ResumeUpload from "./ResumeUpload/ResumeUpload.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/dashboard" element={<Dashboard />} />

      <Route path="/resume-upload" element={<ResumeUpload />} />

      <Route path="/interview/new" element={<Interview />} />
      <Route path="/interview/:id" element={<Interview />} />

      <Route path="/report/:id" element={<Report />} />
    </Routes>
  );
}

export default App;