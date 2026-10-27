
const path = require("path");
const express = require("express");

require("dotenv").config();

const app = require("./src/app");
const connectToDB = require("./src/config/database");

connectToDB();

const frontendPath = path.join(__dirname, "../Frontend/dist");

app.use(express.static(frontendPath));

// Serve the React homepage
app.get("/", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
});

// Serve React routes, but don't override API routes
app.get("/{*splat}", (req, res, next) => {
    if (req.path.startsWith("/api/")) {
        return next();
    }

    res.sendFile(path.join(frontendPath, "index.html"), (err) => {
        if (err) next(err);
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
