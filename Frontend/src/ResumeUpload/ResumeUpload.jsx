import { useState } from "react";
import "./ResumeUpload.css";

const ResumeUpload = () => {
  const [resume, setResume] = useState(null);
  const [jobDescription, setJobDescription] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!resume) {
      alert("Please upload your resume.");
      return;
    }

    if (!jobDescription.trim()) {
      alert("Please paste the Job Description.");
      return;
    }

    // Backend API will be integrated here in the next step.
    console.log({
      resume,
      jobDescription,
    });
  };

  return (
    <div className="resume-upload-page">
      <div className="resume-card">
        <h1>Resume ATS Analysis</h1>

        <p>
          Upload your resume and paste the Job Description to receive an
          AI-powered ATS analysis.
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

          <button type="submit" className="analyze-btn">
            Analyze Resume
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResumeUpload;