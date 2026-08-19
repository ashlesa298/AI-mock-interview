import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FaDownload,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
} from "react-icons/fa";

import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import Loader from "../../components/Loader/Loader";
import Button from "../../components/Button/Button";
import { getReportById, downloadReportPdf } from "../../services/interviewService";
import "./Report.css";

const Report = () => {
  const { id } = useParams();

  const [interviewReport, setInterviewReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getReportById(id);
      setInterviewReport(res.data.interviewReport);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load report.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const res = await downloadReportPdf(id);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `report_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not download PDF.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <Loader fullScreen label="Loading your report..." />
        <Footer />
      </>
    );
  }

  if (error || !interviewReport) {
    return (
      <>
        <Navbar />
        <div className="report-error">
          <h2>😕 {error || "Report not found."}</h2>
        </div>
        <Footer />
      </>
    );
  }

  if (interviewReport.type === "interview" && interviewReport.status !== "completed") {
    return (
      <>
        <Navbar />
        <div className="report-error">
          <div>
            <h2>⏳ This interview hasn't been submitted yet.</h2>
            <p className="report-error-sub">
              Go back to the interview and answer the questions, then submit to see your feedback.
            </p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <section className="report-page">
        <div className="container">
          {interviewReport.type === "ats" ? (
            <AtsReportView
              interviewReport={interviewReport}
              downloading={downloading}
              onDownload={handleDownload}
            />
          ) : (
            <InterviewFeedbackView
              interviewReport={interviewReport}
              downloading={downloading}
              onDownload={handleDownload}
            />
          )}
        </div>
      </section>

      <Footer />
    </>
  );
};

const ScoreRing = ({ score }) => (
  <div className="score-ring" style={{ "--score": score }}>
    <span>{score}%</span>
  </div>
);

const ChipList = ({ items = [], variant }) => (
  <div className="chip-row">
    {items.length === 0 && <span className="chip-empty">None found</span>}
    {items.map((item, i) => (
      <span className={`chip chip-${variant}`} key={i}>
        {item}
      </span>
    ))}
  </div>
);

const InterviewFeedbackView = ({ interviewReport, downloading, onDownload }) => {
  const f = interviewReport.feedback || {};

  return (
    <>
      <div className="report-header">
        <div>
          <h1>{interviewReport.title}</h1>
          <p>{f.overallPerformance}</p>
        </div>

        <div className="report-header-actions">
          <ScoreRing score={f.overallScore ?? interviewReport.matchScore ?? 0} />
          <Button variant="primary" icon={<FaDownload />} loading={downloading} onClick={onDownload}>
            Download PDF
          </Button>
        </div>
      </div>

      <div className="report-section">
        <h2><FaCheckCircle className="icon-green" /> Strengths</h2>
        <ChipList items={f.strengths} variant="green" />
      </div>

      <div className="report-section">
        <h2><FaExclamationTriangle className="icon-orange" /> Weaknesses</h2>
        <ChipList items={f.weaknesses} variant="orange" />
      </div>

      <div className="report-section">
        <h2>💡 Suggestions</h2>
        <ul className="plain-list">
          {(f.suggestions || []).map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      </div>

      <div className="report-section">
        <h2>🧠 Question-by-Question Feedback</h2>
        {(f.questionFeedback || []).map((q, i) => (
          <div className="qa-card" key={q.questionId || i}>
            <div className="qa-card-head">
              <p className="qa-question"><strong>Q{i + 1}.</strong> {q.question}</p>
              <span className="qa-score">{q.score}/10</span>
            </div>
            <p className="qa-answer"><em>Your answer:</em> {q.answer || "(No answer provided)"}</p>
            <p className="qa-meta"><em>Feedback:</em> {q.feedback}</p>
          </div>
        ))}
      </div>
    </>
  );
};

const AtsReportView = ({ interviewReport, downloading, onDownload }) => {
  const a = interviewReport.atsReport || {};

  return (
    <>
      <div className="report-header">
        <div>
          <h1>{interviewReport.title}</h1>
          <p>{a.jobDescriptionMatch}</p>
        </div>

        <div className="report-header-actions">
          <ScoreRing score={a.matchScore ?? interviewReport.matchScore ?? 0} />
          <Button variant="primary" icon={<FaDownload />} loading={downloading} onClick={onDownload}>
            Download PDF
          </Button>
        </div>
      </div>

      <div className="report-section">
        <h2>📈 Experience Match</h2>
        <p className="plain-text">{a.experienceMatch}</p>
      </div>

      <div className="report-section two-col">
        <div>
          <h2><FaCheckCircle className="icon-green" /> Matching Skills</h2>
          <ChipList items={a.matchingSkills} variant="green" />
        </div>
        <div>
          <h2><FaTimesCircle className="icon-red" /> Missing Skills</h2>
          <ChipList items={a.missingSkills} variant="red" />
        </div>
      </div>

      <div className="report-section two-col">
        <div>
          <h2><FaCheckCircle className="icon-green" /> Matching Keywords</h2>
          <ChipList items={a.matchingKeywords} variant="green" />
        </div>
        <div>
          <h2><FaTimesCircle className="icon-red" /> Missing Keywords</h2>
          <ChipList items={a.missingKeywords} variant="red" />
        </div>
      </div>

      <div className="report-section">
        <h2><FaCheckCircle className="icon-green" /> Resume Strengths</h2>
        <ul className="plain-list">
          {(a.strengths || []).map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      </div>

      <div className="report-section">
        <h2><FaExclamationTriangle className="icon-orange" /> Resume Weaknesses</h2>
        <ul className="plain-list">
          {(a.weaknesses || []).map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      </div>

      <div className="report-section">
        <h2>💡 Suggestions to Improve</h2>
        <ul className="plain-list">
          {(a.suggestions || []).map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default Report;