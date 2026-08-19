const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const interviewController = require("../controllers/interview.controller");
const upload = require("../middlewares/file.middleware");

const interviewRouter = express.Router();

/**
 * @route POST /api/interview/questions
 * @description Generate AI interview questions (resume + selfDescription + jobDescription)
 * @access Private
 */
interviewRouter.post(
  "/questions",
  authMiddleware.authUser,
  upload.single("resume"),
  interviewController.generateQuestionsController
);

/**
 * @route PATCH /api/interview/:interviewId/answers
 * @description Save/update answers for a pending interview
 * @access Private
 */
interviewRouter.patch(
  "/:interviewId/answers",
  authMiddleware.authUser,
  interviewController.saveAnswersController
);

/**
 * @route POST /api/interview/:interviewId/submit
 * @description Submit the interview and generate AI feedback
 * @access Private
 */
interviewRouter.post(
  "/:interviewId/submit",
  authMiddleware.authUser,
  interviewController.submitInterviewController
);

/**
 * @route POST /api/interview/ats
 * @description Generate an ATS resume analysis (resume + jobDescription)
 * @access Private
 */
interviewRouter.post(
  "/ats",
  authMiddleware.authUser,
  upload.single("resume"),
  interviewController.generateAtsController
);

/**
 * @route GET /api/interview
 * @description Get all reports (interview + ats) for the logged-in user
 * @access Private
 */
interviewRouter.get("/", authMiddleware.authUser, interviewController.getAllInterviewReportsController);

/**
 * @route GET /api/interview/:interviewId
 * @description Get a single report by id
 * @access Private
 */
interviewRouter.get(
  "/:interviewId",
  authMiddleware.authUser,
  interviewController.getInterviewReportByIdController
);

/**
 * @route GET /api/interview/:interviewReportId/pdf
 * @description Download the report as a PDF
 * @access Private
 */
interviewRouter.get(
  "/:interviewReportId/pdf",
  authMiddleware.authUser,
  interviewController.generateReportPdfController
);

module.exports = interviewRouter;