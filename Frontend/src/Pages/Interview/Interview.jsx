import { useState } from "react";
import "./Interview.css";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import Button from "../../components/Button/Button";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  generateQuestions,
  saveAnswers,
  submitInterview,
} from "../../services/interviewService";

const Interview = () => {
  const navigate = useNavigate();

  // "setup" -> filling resume/JD form | "answering" -> answering generated questions
  const [step, setStep] = useState("setup");

  const [resume, setResume] = useState(null);
  const [selfDescription, setSelfDescription] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [generating, setGenerating] = useState(false);

  const [interviewReport, setInterviewReport] = useState(null);
  const [answers, setAnswers] = useState({}); // { questionId: answerText }
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const generateHandler = async (e) => {
    e.preventDefault();

    if (!resume) {
      return toast.error("Please upload your resume");
    }
    if (!jobDescription.trim()) {
      return toast.error("Please paste the job description");
    }

    const formData = new FormData();
    formData.append("resume", resume);
    formData.append("selfDescription", selfDescription);
    formData.append("jobDescription", jobDescription);

    try {
      setGenerating(true);
      const res = await generateQuestions(formData);
      const report = res.data.interviewReport;

      setInterviewReport(report);

      const initialAnswers = {};
      report.answers.forEach((a) => {
        initialAnswers[a.questionId] = a.answer || "";
      });
      setAnswers(initialAnswers);

      setStep("answering");
      toast.success(`${report.questions.length} questions generated 🎉`);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not generate questions");
    } finally {
      setGenerating(false);
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const buildAnswersPayload = () =>
    Object.entries(answers).map(([questionId, answer]) => ({ questionId, answer }));

  const saveProgress = async () => {
    try {
      setSaving(true);
      await saveAnswers(interviewReport._id, buildAnswersPayload());
      toast.success("Progress saved");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not save answers");
    } finally {
      setSaving(false);
    }
  };

  const submitHandler = async () => {
    const unanswered = interviewReport.questions.filter(
      (q) => !answers[q.questionId]?.trim()
    );

    if (unanswered.length > 0) {
      const proceed = window.confirm(
        `You haven't answered ${unanswered.length} question(s). Submit anyway?`
      );
      if (!proceed) return;
    }

    try {
      setSubmitting(true);
      await saveAnswers(interviewReport._id, buildAnswersPayload());
      const res = await submitInterview(interviewReport._id);
      toast.success("Feedback generated 🎉");
      navigate(`/report/${res.data.interviewReport._id}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not submit interview");
    } finally {
      setSubmitting(false);
    }
  };

  if (step === "answering" && interviewReport) {
    return (
      <>
        <Navbar />

        <section className="interview">
          <div className="container">
            <div className="answering-box">
              <h1>🎤 {interviewReport.title}</h1>
              <p>Answer each question in your own words, then submit for AI feedback.</p>

              {interviewReport.questions.map((q, i) => (
                <div className="question-card" key={q.questionId}>
                  <div className="question-header">
                    <span className={`category-badge cat-${q.category}`}>{q.category}</span>
                    <span className="q-number">Q{i + 1}</span>
                  </div>
                  <p className="question-text">{q.question}</p>
                  <textarea
                    rows="4"
                    placeholder="Type your answer here..."
                    value={answers[q.questionId] || ""}
                    onChange={(e) => handleAnswerChange(q.questionId, e.target.value)}
                  />
                </div>
              ))}

              <div className="answering-actions">
                <Button variant="outline" onClick={saveProgress} loading={saving}>
                  Save Progress
                </Button>
                <Button onClick={submitHandler} loading={submitting}>
                  Submit Interview
                </Button>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <section className="interview">
        <div className="container">
          <div className="interview-box">
            <h1>🤖 AI Interview Generator</h1>
            <p>Upload your resume and job description to get tailored interview questions.</p>

            <form onSubmit={generateHandler}>
              <label>Resume (PDF)</label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setResume(e.target.files[0])}
                required
              />

              <label>Tell us about yourself (optional)</label>
              <textarea
                rows="5"
                placeholder="A short summary of your background, goals, and what you're looking for..."
                value={selfDescription}
                onChange={(e) => setSelfDescription(e.target.value)}
              />

              <label>Job Description</label>
              <textarea
                rows="8"
                placeholder="Paste the full job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                required
              />

              <Button type="submit" fullWidth loading={generating}>
                🚀 Generate Interview Questions
              </Button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Interview;