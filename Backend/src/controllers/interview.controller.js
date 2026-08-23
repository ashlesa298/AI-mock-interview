const pdfParse = require("pdf-parse");
const {
  generateInterviewQuestions,
  generateInterviewFeedback,
  generateAtsAnalysis,
  generateReportPdf,
} = require("../services/ai.service");
const interviewReportModel = require("../models/interviewReport.model");
const asyncHandler = require("../utils/asyncHandler");

async function extractResumeText(file) {
  if (!file) return "";
  const data = await pdfParse(file.buffer);
  return data.text || "";
}

/**
 * @route POST /api/interview/questions
 * @description Generate AI interview questions from resume + self description + job description.
 * Creates a "pending" interview report holding the questions (no answers/feedback yet).
 */
const generateQuestionsController = asyncHandler(async function (req, res) {
  if (!req.file) {
    return res.status(400).json({ message: "Resume PDF is required." });
  }

  const { selfDescription, jobDescription } = req.body;

  if (!jobDescription) {
    return res.status(400).json({ message: "Job description is required." });
  }

  const resumeContent = await extractResumeText(req.file);

  const aiResult = await generateInterviewQuestions({
    resume: resumeContent,
    selfDescription,
    jobDescription,
  });

  const questions = aiResult.questions.map((q, i) => ({
    questionId: `q${i + 1}`,
    category: q.category,
    question: q.question,
    intention: q.intention,
  }));

  const interviewReport = await interviewReportModel.create({
    type: "interview",
    status: "pending",
    title: aiResult.title || "Software Engineer",
    resume: resumeContent,
    selfDescription,
    jobDescription,
    questions,
    answers: questions.map((q) => ({ questionId: q.questionId, answer: "" })),
    user: req.user.id,
  });

  res.status(201).json({
    message: "Interview questions generated successfully.",
    interviewReport,
  });
});

/**
 * @route PATCH /api/interview/:interviewId/answers
 * @description Save/update one or more answers for a pending interview.
 * body: { answers: [{ questionId, answer }] }
 */
const saveAnswersController = asyncHandler(async function (req, res) {
  const { interviewId } = req.params;
  const { answers } = req.body;

  if (!Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({ message: "answers array is required." });
  }

  const interviewReport = await interviewReportModel.findOne({
    _id: interviewId,
    user: req.user.id,
    type: "interview",
  });

  if (!interviewReport) {
    return res.status(404).json({ message: "Interview not found." });
  }

  if (interviewReport.status === "completed") {
    return res.status(400).json({ message: "This interview has already been submitted." });
  }

  const answerMap = new Map(interviewReport.answers.map((a) => [a.questionId, a.answer]));
  answers.forEach(({ questionId, answer }) => {
    if (questionId) answerMap.set(questionId, answer ?? "");
  });

  interviewReport.answers = Array.from(answerMap, ([questionId, answer]) => ({ questionId, answer }));
  await interviewReport.save();

  res.status(200).json({
    message: "Answers saved successfully.",
    interviewReport,
  });
});

/**
 * @route POST /api/interview/:interviewId/submit
 * @description Submit the interview: send stored Q&A to Gemini and generate real feedback.
 */
const submitInterviewController = asyncHandler(async function (req, res) {
  const { interviewId } = req.params;

  const interviewReport = await interviewReportModel.findOne({
    _id: interviewId,
    user: req.user.id,
    type: "interview",
  });

  if (!interviewReport) {
    return res.status(404).json({ message: "Interview not found." });
  }

  if (interviewReport.status === "completed") {
    return res.status(200).json({
      message: "Interview already submitted.",
      interviewReport,
    });
  }

  const feedback = await generateInterviewFeedback({
    questions: interviewReport.questions,
    answers: interviewReport.answers,
    resume: interviewReport.resume,
    jobDescription: interviewReport.jobDescription,
  });

  interviewReport.feedback = feedback;
  interviewReport.matchScore = feedback.overallScore;
  interviewReport.status = "completed";
  await interviewReport.save();

  res.status(200).json({
    message: "Interview submitted and feedback generated successfully.",
    interviewReport,
  });
});

/**
 * @route POST /api/interview/ats
 * @description Analyze a resume against a job description (ATS-style report).
 */
const generateAtsController = asyncHandler(async function (req, res) {
  if (!req.file) {
    return res.status(400).json({ message: "Resume PDF is required." });
  }

  const { jobDescription } = req.body;

  if (!jobDescription) {
    return res.status(400).json({ message: "Job description is required." });
  }

  const resumeContent = await extractResumeText(req.file);

  const atsReport = await generateAtsAnalysis({
    resume: resumeContent,
    jobDescription,
  });

  const interviewReport = await interviewReportModel.create({
    type: "ats",
    status: "completed",
    title: atsReport.title || "Resume ATS Analysis",
    matchScore: atsReport.matchScore || 0,
    resume: resumeContent,
    jobDescription,
    atsReport,
    user: req.user.id,
  });

  res.status(201).json({
    message: "ATS analysis generated successfully.",
    interviewReport,
  });
});

/**
 * @route GET /api/interview/:interviewId
 */
const getInterviewReportByIdController = asyncHandler(async function (req, res) {
  const { interviewId } = req.params;

  const interviewReport = await interviewReportModel.findOne({
    _id: interviewId,
    user: req.user.id,
  });

  if (!interviewReport) {
    return res.status(404).json({ message: "Report not found." });
  }

  res.status(200).json({
    message: "Report fetched successfully.",
    interviewReport,
  });
});

/**
 * @route GET /api/interview
 */
const getAllInterviewReportsController = asyncHandler(async function (req, res) {
  const interviewReports = await interviewReportModel
    .find({ user: req.user.id })
    .sort({ createdAt: -1 })
    .select("type status title matchScore jobDescription createdAt");

  res.status(200).json({
    message: "Reports fetched successfully.",
    interviewReports,
  });
});

/**
 * @route GET /api/interview/:interviewReportId/pdf
 */
const generateReportPdfController = asyncHandler(async function (req, res) {
  const { interviewReportId } = req.params;

  const interviewReport = await interviewReportModel.findOne({
    _id: interviewReportId,
    user: req.user.id,
  });

  if (!interviewReport) {
    return res.status(404).json({ message: "Report not found." });
  }

  if (interviewReport.type === "interview" && interviewReport.status !== "completed") {
    return res.status(400).json({ message: "Submit the interview before downloading the report." });
  }

  const pdfBuffer = await generateReportPdf(interviewReport);

  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename=report_${interviewReportId}.pdf`,
  });

  res.send(pdfBuffer);
});

module.exports = {
  generateQuestionsController,
  saveAnswersController,
  submitInterviewController,
  generateAtsController,
  getInterviewReportByIdController,
  getAllInterviewReportsController,
  generateReportPdfController,
};