require("dotenv").config({path:"../.env"}); 
const express = require("express");
const connectDB = require("./config/db");
const errorHandler = require("./middlewares/errorHandler");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

// Connect to MongoDB
connectDB();

const app = express();
app.use(express.json());

// Define Routes
app.get("/", (req, res) => {
  res.status(200).send("Ashrafi Mining API is running...");
});

// Auth Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

// Error Handling Middleware
app.use(errorHandler);

module.exports = app;
