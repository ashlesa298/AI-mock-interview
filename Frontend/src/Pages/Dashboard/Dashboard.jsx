import "./Dashboard.css";
import { useEffect, useState } from "react";
import {
  FaUserCircle,
  FaRobot,
  FaFileAlt,
  FaChartLine,
  FaPlayCircle,
  FaArrowRight
} from "react-icons/fa";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import useAuth from "../../hooks/useAuth";
import { getReports } from "../../services/interviewService";

const Dashboard = () => {

  const { user } = useAuth();

  const [reports, setReports] = useState([]);

  useEffect(() => {

    loadReports();

  }, []);

  const loadReports = async () => {

    try {

      const res = await getReports();

setReports(res.data.interviewReports || []);

    } catch (err) {

      console.log(err);

    }

  };

  return (

    <>

      <Navbar />

      <section className="dashboard">

        <div className="container">

          <div className="dashboard-header">

            <div>

              <h1>

                👋 Welcome,

                {user?.name || "Candidate"}

              </h1>

              <p>

                Let's prepare for your dream company.

              </p>

            </div>

            <FaUserCircle className="profile-icon"/>

          </div>

          <div className="dashboard-cards">

            <div className="card blue">

              <FaRobot/>

              <h2>AI Interview</h2>

              <p>

                Start unlimited AI mock interviews.

              </p>

              <Link to="/interview/new">

                <button>

                  Start

                  <FaArrowRight/>

                </button>

              </Link>

            </div>

            <div className="card green">

              <FaChartLine/>

              <h2>Performance</h2>

              <p>

                Track your interview progress.

              </p>

              <h3>

                {reports.length}

              </h3>

            </div>

            <div className="card orange">

              <FaFileAlt/>

              <h2>Reports</h2>

              <p>

                Download previous reports.

              </p>

              <h3>

                {reports.length}

              </h3>

            </div>

          </div>

          <div className="recent-section">

            <h2>

              📄 Recent Interviews

            </h2>

            {

              reports.length===0

              ?

              <div className="empty">

                <FaPlayCircle/>

                <p>

                  No interviews found.

                </p>

              </div>

              :

              reports.map((item,index)=>(

                <div

                className="report-card"

                key={index}

                >

                  <div>

                    <h3>

                      {item.jobRole || "AI Interview"}

                    </h3>

                    <p>

                      {item.company || "Company"}

                    </p>

                  </div>

                  <Link

                  to={`/report/${item._id}`}

                  >

                    View

                  </Link>

                </div>

              ))

            }

          </div>

        </div>

      </section>

      <Footer/>

    </>

  );

};

export default Dashboard;