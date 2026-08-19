import "./Footer.css";
import { FaRobot, FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-container">
        <div className="footer-brand">
          <FaRobot /> AI Interview
        </div>

        <p className="footer-text">
          Helping candidates prepare smarter with AI-powered mock interviews
          and resume analysis.
        </p>

        <div className="footer-socials">
          <a href="#" aria-label="GitHub"><FaGithub /></a>
          <a href="#" aria-label="LinkedIn"><FaLinkedin /></a>
          <a href="#" aria-label="Email"><FaEnvelope /></a>
        </div>

        <p className="footer-copy">
          © {new Date().getFullYear()} AI Interview Platform. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;