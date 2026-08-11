import "./Footer.css";
import {
  FaGithub,
  FaLinkedin,
  FaInstagram,
  FaEnvelope,
  FaRobot,
  FaHeart,
} from "react-icons/fa";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">

      <div className="container footer-container">

        <div className="footer-left">

          <h2>
            <FaRobot /> AI Interview
          </h2>

          <p>
            Prepare smarter, practice better and land your dream job with AI.
          </p>

        </div>

        <div className="footer-middle">

          <h3>Quick Links</h3>

          <a href="/">🏠 Home</a>
          <a href="/dashboard">📊 Dashboard</a>
          <a href="/interview">🎤 Interview</a>
          <a href="/login">🔐 Login</a>

        </div>

        <div className="footer-right">

          <h3>Connect</h3>

          <div className="social-icons">

            <a href="#">
              <FaGithub />
            </a>

            <a href="#">
              <FaLinkedin />
            </a>

            <a href="#">
              <FaInstagram />
            </a>

            <a href="#">
              <FaEnvelope />
            </a>

          </div>

        </div>

      </div>

      <div className="footer-bottom">
        © {year} AI Interview Platform • Made with{" "}
        <FaHeart className="heart" /> using React & MERN
      </div>

    </footer>
  );
};

export default Footer;