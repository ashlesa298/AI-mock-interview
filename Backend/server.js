const path = require("path");
const express = require("express");

require("dotenv").config();

const app = require("./src/app");
const connectToDB = require("./src/config/database");

connectToDB();

// Serve React frontend
const frontendPath = path.join(__dirname, "../Frontend/dist");

app.use(express.static(frontendPath));

app.get("/{*splat}", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
});

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${process.env.PORT || 3000}`);
});