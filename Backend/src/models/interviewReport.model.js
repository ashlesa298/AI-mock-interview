const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    questionId: { type: String, required: true },
    category: { type: String, enum: ["technical", "behavioral"], required: true },
    question: { type: String, required: true },
    intention: { type: String, default: "" },
  },
  { _id: false }
);

const answerSchema = new mongoose.Schema(
  {
    questionId: { type: String, required: true },
    answer: { type: String, default: "" },
  },
  { _id: false }
);

const interviewReportSchema = new mongoose.Schema(
  {
    // "interview"  -> AI mock interview (questions -> answers -> feedback)
    // "ats"        -> resume vs job-description ATS analysis
    type: {
      type: String,
      enum: ["interview", "ats"],
      default: "interview",
    },

    // relevant only for type "interview": pending until the user submits answers
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },

    title: {
      type: String,
      required: true,
    },

    // overall score: ATS match score for "ats", overall interview score for "interview"
    matchScore: {
      type: Number,
      default: 0,
    },

    resume: {
      type: String,
      default: "",
    },

    selfDescription: {
      type: String,
      default: "",
    },

    jobDescription: {
      type: String,
      required: true,
    },

    // type "interview" only
    questions: {
      type: [questionSchema],
      default: undefined,
    },
    answers: {
      type: [answerSchema],
      default: undefined,
    },
    feedback: {
      type: Object,
      default: undefined,
    },

    // type "ats" only
    atsReport: {
      type: Object,
      default: undefined,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("InterviewReport", interviewReportSchema);