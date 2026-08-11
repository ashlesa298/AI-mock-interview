import "./Hero.css";
import { Link } from "react-router-dom";
import {
  FaRobot,
  FaArrowRight,
  FaFileUpload,
  FaBrain,
} from "react-icons/fa";

const Hero = () => {
  return (
    <section className="hero">
      <div className="container hero-container">
        <div className="hero-left">
          <span className="badge">
            🤖 AI Powered Interview Preparation
          </span>

          <h1>
            Crack Your
            <span> Dream Job </span>
            with AI
          </h1>

          <p>
            Practice AI-powered mock interviews or upload your resume
            to receive an ATS analysis based on the job description.
          </p>

          <div className="hero-buttons">
            <Link to="/dashboard">
              <button className="primary-btn">
                🚀 Start Interview
                <FaArrowRight />
              </button>
            </Link>

            <Link to="/resume-upload">
              <button className="secondary-btn">
                <FaFileUpload />
                Upload Resume
              </button>
            </Link>
          </div>

          <div className="hero-features">
            <div>
              <FaBrain />
              AI Interview
            </div>

            <div>
              📄 ATS Resume Analysis
            </div>

            <div>
              📊 AI Report
            </div>
          </div>
        </div>

        <div className="hero-right">
          <div className="robot-card">
            <div className="robot-circle">
              <FaRobot />
            </div>

            <h2>AI Interviewer</h2>

            <p>
              Ready to help you prepare for your next interview.
            </p>

            <div className="robot-status">
              🟢 Online
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;