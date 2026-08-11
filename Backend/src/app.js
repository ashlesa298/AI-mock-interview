const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

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


// Routes
const authRouter = require("./routes/auth.routes");
const interviewRouter = require("./routes/interview.routes");


// Route mounting
app.use("/api/auth", authRouter);
app.use("/api/interview", interviewRouter);


module.exports = app;