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
import teamRoutes from "./routes/teamRoutes.js";
import matchRoutes from "./routes/matchRoutes.js";
import playerRoutes from "./routes/playerRoutes.js";
import carruselRoutes from "./routes/carruselRoutes.js";
import teamChangeLogRoutes from "./routes/teamChangeLogRoutes.js";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import jwt from "jsonwebtoken";
import User from "./models/userModel.js";

dotenv.config();

// Conection to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// Configuración de Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

// Namespace para admins
const adminNamespace = io.of("/admin");

adminNamespace.use(async (socket, next) => {
  try {
    const token = socket.handshake.query?.token;
    if (!token) {
      return next(new Error("No token provided"));
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || user.role !== "admin") {
      return next(new Error("Not authorized as admin"));
    }
    socket.user = user; // Guardar info del usuario en el socket
    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
});

adminNamespace.on("connection", (socket) => {
  console.log(`Admin conectado: ${socket.user.email}`);
  socket.on("disconnect", () => {
    console.log(`Admin desconectado: ${socket.user.email}`);
  });
});

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
app.use("/api/teams", teamRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/players", playerRoutes);
app.use("/api/carrusel", carruselRoutes);
app.use("/api/changelog", teamChangeLogRoutes);

// Middleware for handling errors
app.use(notFound);
app.use(errorHandler);

// Start the server (usando http + socket.io)
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Exportar adminNamespace para emitir eventos desde otros módulos
export { adminNamespace };
