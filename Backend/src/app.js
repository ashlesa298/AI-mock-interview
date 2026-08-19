const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const { errorHandler, notFound } = require("./middlewares/error.middleware");

const app = express();


// Middlewares
app.use(express.json());
app.use(cookieParser());


// CORS Configuration
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);


// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});


// Routes
const authRouter = require("./routes/auth.routes");
const interviewRouter = require("./routes/interview.routes");


// Route mounting
app.use("/api/auth", authRouter);
app.use("/api/interview", interviewRouter);


// 404 + error handler (must be last)
app.use(notFound);
app.use(errorHandler);


module.exports = app;