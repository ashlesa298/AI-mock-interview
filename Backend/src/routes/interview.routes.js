const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const interviewController = require("../controllers/interview.controller");
const upload = require("../middlewares/file.middleware");

const interviewRouter = express.Router();

/**
 * ----------------------------------------
 * AI Interview Routes
 * ----------------------------------------
 */

/**
 * Generate Interview Questions
 * (Will be implemented next)
 */
interviewRouter.post(
  "/questions",
  authMiddleware.authUser,
  upload.single("resume"),
  interviewController.generateInterViewReportController
);

/**
 * Evaluate Interview Answers
 * (Will be implemented later)
 */
interviewRouter.post(
  "/evaluate",
  authMiddleware.authUser,
  interviewController.generateInterViewReportController
);

/**
 * ----------------------------------------
 * Resume ATS Analysis
 * ----------------------------------------
 */

/**
 * Analyze Resume against Job Description
 * (Will reuse Gemini AI service)
 */
interviewRouter.post(
  "/ats",
  authMiddleware.authUser,
  upload.single("resume"),
  interviewController.generateInterViewReportController
);

/**
 * ----------------------------------------
 * Reports
 * ----------------------------------------
 */

/**
 * Get Report by ID
 */
interviewRouter.get(
  "/report/:interviewId",
  authMiddleware.authUser,
  interviewController.getInterviewReportByIdController
);

/**
 * Get All Reports
 */
interviewRouter.get(
  "/",
  authMiddleware.authUser,
  interviewController.getAllInterviewReportsController
);

/**
 * Download Resume PDF
 */
interviewRouter.get(
  "/resume/pdf/:interviewReportId",
  authMiddleware.authUser,
  interviewController.generateResumePdfController
);
module.exports = interviewRouter;