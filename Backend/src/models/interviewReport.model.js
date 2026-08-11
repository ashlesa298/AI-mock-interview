const mongoose = require("mongoose");

const interviewReportSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    jobDescription: {
      type: String,
      required: true,
    },

    report: {
      type: Object,
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("InterviewReport", interviewReportSchema);