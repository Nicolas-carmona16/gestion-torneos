import express from "express";
import {
  registerTeam,
  removePlayerFromTeam,
  addPlayersToTeam,
  getTeamsByTournament,
  getTeamById,
} from "../controllers/teamController.js";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import {
  validateRegisterTeam,
  validateAddPlayers,
} from "../middlewares/teamValidations.js";

const router = express.Router();

router.post(
  "/register",
  validateRegisterTeam,
  protect,
  authorizeRoles("captain"),
  registerTeam
);
router.post(
  "/remove-player",
  protect,
  authorizeRoles("captain", "admin"),
  removePlayerFromTeam
);
router.post(
  "/add-players",
  validateAddPlayers,
  protect,
  authorizeRoles("captain", "admin"),
  addPlayersToTeam
);
router.get("/tournament/:tournamentId", getTeamsByTournament);
router.get("/:teamId", getTeamById);

export default router;
