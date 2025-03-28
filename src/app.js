require("dotenv").config({path:"../.env"}); 
console.log("FRONTEND_URL:", process.env.FRONTEND_URL);

const express = require("express");
const cors = require("cors"); // Import CORS

const connectDB = require("./config/db");
const errorHandler = require("./middlewares/errorHandler");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

// Connect to MongoDB
connectDB();

const app = express();
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "https://darling-haupia-64d778.netlify.app",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // Allow cookies if needed
  })
);
app.use(express.json());

// Define Routes
app.get("/", (req, res) => {
  res.status(200).send("Ashrafi Mining API is running....");
});

// Auth Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

// Error Handling Middleware
app.use(errorHandler);

module.exports = app;
