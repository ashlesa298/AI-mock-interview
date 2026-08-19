import "./Dashboard.css";
import { useEffect, useState } from "react";
import {
  FaUserCircle,
  FaRobot,
  FaFileAlt,
  FaChartLine,
  FaPlayCircle,
  FaArrowRight,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import Loader from "../../components/Loader/Loader";
import InterviewCard from "../../components/InterviewCard/InterviewCard";
import useAuth from "../../hooks/useAuth";
import { getReports } from "../../services/interviewService";

const Dashboard = () => {
  const { user } = useAuth();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const res = await getReports();
      setReports(res.data.interviewReports || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const completedReports = reports.filter((r) => r.type === "ats" || r.status === "completed");

  const avgScore = completedReports.length
    ? Math.round(
        completedReports.reduce((sum, r) => sum + (r.matchScore || 0), 0) / completedReports.length
      )
    : 0;

  return (
    <>
      <Navbar />

      <section className="dashboard">
        <div className="container">
          <div className="dashboard-header">
            <div>
              <h1>👋 Welcome, {user?.username || "Candidate"}</h1>
              <p>Let's prepare for your dream company.</p>
            </div>
            <FaUserCircle className="profile-icon" />
          </div>

          <div className="dashboard-cards">
            <div className="card blue">
              <FaRobot />
              <h2>AI Interview</h2>
              <p>Start unlimited AI mock interviews.</p>
              <Link to="/interview/new">
                <button>
                  Start
                  <FaArrowRight />
                </button>
              </Link>
            </div>

            <div className="card green">
              <FaChartLine />
              <h2>Avg. Score</h2>
              <p>Across all your completed reports.</p>
              <h3>{avgScore}%</h3>
            </div>

            <div className="card orange">
              <FaFileAlt />
              <h2>Reports</h2>
              <p>Total interview + ATS reports generated.</p>
              <h3>{reports.length}</h3>
            </div>
          </div>

          <div className="recent-section">
            <h2>📄 Recent Reports</h2>

            {loading ? (
              <Loader label="Loading your reports..." />
            ) : reports.length === 0 ? (
              <div className="empty">
                <FaPlayCircle />
                <p>No reports yet. Start an AI interview or upload your resume!</p>
                <Link to="/interview/new">
                  <button>Start Now</button>
                </Link>
              </div>
            ) : (
              reports.map((item) => <InterviewCard report={item} key={item._id} />)
            )}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Dashboard;