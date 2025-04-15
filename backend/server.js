/**
 * @file server.js
 * @description This file sets up the Express server, Set up middleware, routes, and error handling.
 */

import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import { notFound, errorHandler } from "./middlewares/errorMiddleware.js";
import userRoutes from "./routes/userRoutes.js";
import sportRoutes from "./routes/sportRoutes.js";
import tournamentRoutes from "./routes/tournamentRoutes.js";

dotenv.config();

// Conection to MongoDB
connectDB();

const app = express();

// Middlewares
app.use(cors({ credentials: true, origin: "http://localhost:5173" }));
app.use(express.json());
app.use(cookieParser());

/**
 * @route GET /
 * @description Test route to check if the server is running
 */
app.get("/", (req, res) => {
  res.send("API is running...");
});

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/sports", sportRoutes);
app.use("/api/tournaments", tournamentRoutes);

// Middleware for handling errors
app.use(notFound);
app.use(errorHandler);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
