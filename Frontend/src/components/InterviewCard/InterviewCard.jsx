import { Link } from "react-router-dom";
import { FaArrowRight, FaCalendarAlt } from "react-icons/fa";
import "./InterviewCard.css";

const scoreClass = (score) => {
  if (score >= 75) return "score-high";
  if (score >= 50) return "score-mid";
  return "score-low";
};

const InterviewCard = ({ report }) => {
  const { _id, title, matchScore = 0, createdAt, type, status } = report;
  const isPending = type === "interview" && status !== "completed";

  const date = createdAt
    ? new Date(createdAt).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

  return (
    <div className="interview-card">
      {isPending ? (
        <div className="interview-card-score score-pending">...</div>
      ) : (
        <div className={`interview-card-score ${scoreClass(matchScore)}`}>{matchScore}%</div>
      )}

      <div className="interview-card-body">
        <h3>
          {title || "AI Interview"}
          <span className={`type-tag type-${type}`}>{type === "ats" ? "ATS" : "Interview"}</span>
        </h3>
        <p className="interview-card-date">
          <FaCalendarAlt /> {date} {isPending && "· Not submitted yet"}
        </p>
      </div>

      <Link to={`/report/${_id}`} className="interview-card-link">
        {isPending ? "Status" : "View"} <FaArrowRight />
      </Link>
    </div>
  );
};

export default InterviewCard;