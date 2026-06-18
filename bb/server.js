require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/mongodb");

const app = express();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true
}));
app.use(express.json());

// Database connection
connectDB();

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/user", require("./routes/user"));

// Health check route
app.get("/", (req, res) => {
    res.json({
        message: "Backend API Running",
        status: "ok"
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error("Error:", err);
    res.status(500).json({
        message: "Internal server error",
        error: process.env.NODE_ENV === "development" ? err.message : "Unknown error"
    });
});

// Server start
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
