import API from "../utils/axios";

// Get all reports (interview + ats) for the logged-in user
export const getReports = () => {
  return API.get("/interview");
};

// Get a single report by id
export const getReportById = (id) => {
  return API.get(`/interview/${id}`);
};

// --- Interview (Q&A) flow ---

// Step 1: generate interview questions (multipart: resume, selfDescription, jobDescription)
export const generateQuestions = (formData) => {
  return API.post("/interview/questions", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// Step 2: save/update one or more answers { answers: [{ questionId, answer }] }
export const saveAnswers = (id, answers) => {
  return API.patch(`/interview/${id}/answers`, { answers });
};

// Step 3: submit the interview -> triggers Gemini feedback generation
export const submitInterview = (id) => {
  return API.post(`/interview/${id}/submit`);
};

// --- ATS flow ---

// Generate ATS analysis (multipart: resume, jobDescription)
export const generateAts = (formData) => {
  return API.post("/interview/ats", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// --- Shared ---

// Download the polished PDF version of a report
export const downloadReportPdf = (id) => {
  return API.get(`/interview/${id}/pdf`, { responseType: "blob" });
};