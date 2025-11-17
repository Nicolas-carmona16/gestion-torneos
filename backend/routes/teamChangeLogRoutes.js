import express from "express";
import {
  getTeamChangeLog,
  getUnreadChanges,
  markAsRead,
  markAllAsRead,
} from "../controllers/teamChangeLogController.js";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Obtener todas las novedades (con filtros opcionales)
router.get("/", protect, authorizeRoles("admin"), getTeamChangeLog);

// Obtener novedades no leídas
router.get("/unread", protect, authorizeRoles("admin"), getUnreadChanges);

// Marcar una novedad como leída
router.patch("/:changeId/read", protect, authorizeRoles("admin"), markAsRead);

// Marcar todas como leídas
router.patch("/read-all", protect, authorizeRoles("admin"), markAllAsRead);

export default router;
