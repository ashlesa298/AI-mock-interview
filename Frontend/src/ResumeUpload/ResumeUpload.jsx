import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "./ResumeUpload.css";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import Button from "../components/Button/Button";
import { generateAts } from "../services/interviewService";

const ResumeUpload = () => {
  const navigate = useNavigate();

  const [resume, setResume] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!resume) {
      return toast.error("Please upload your resume.");
    }

    if (!jobDescription.trim()) {
      return toast.error("Please paste the job description.");
    }

    const formData = new FormData();
    formData.append("resume", resume);
    formData.append("jobDescription", jobDescription);

    try {
      setLoading(true);
      const res = await generateAts(formData);
      toast.success("ATS Analysis Ready 🎉");
      navigate(`/report/${res.data.interviewReport._id}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="resume-upload-page">
        <div className="resume-card">
          <h1>Resume ATS Analysis</h1>

          <p>
            Upload your resume and paste the Job Description to receive an
            AI-powered ATS match score, missing-skill breakdown, and tailored
            interview prep.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Upload Resume (PDF)</label>

              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setResume(e.target.files[0])}
              />
            </div>

            <div className="form-group">
              <label>Job Description</label>

              <textarea
                rows="10"
                placeholder="Paste the Job Description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </div>

            <Button type="submit" fullWidth loading={loading}>
              Analyze Resume
            </Button>
          </form>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ResumeUpload;