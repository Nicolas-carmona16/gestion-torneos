import express from "express";
import {
  createGroupStage,
  getTournamentMatches,
  getGroupStandings,
  updateMatch,
  getMatchesByMatchday,
  getSingleMatchday,
  createEliminationBracket,
  createPlayoffBracket,
  addSeriesGameResult,
  getBracket,
  addScorers,
  getTournamentScorers,
} from "../controllers/matchController.js";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/:tournamentId/groups", protect, authorizeRoles("admin"), createGroupStage);
router.get("/:tournamentId/matches", getTournamentMatches);
router.get("/:tournamentId/standings", getGroupStandings);
router.put("/:matchId", protect, authorizeRoles("admin", "assistant"), updateMatch);
router.get("/:tournamentId/matchdays", getMatchesByMatchday);
router.get("/:tournamentId/matchdays/:matchday", getSingleMatchday);
router.post("/:tournamentId/elimination", protect, authorizeRoles("admin"), createEliminationBracket);
router.post("/:tournamentId/playoff", protect, authorizeRoles("admin"),createPlayoffBracket);
router.post("/:matchId/series", protect, authorizeRoles("admin", "assistant"),addSeriesGameResult);
router.get("/:tournamentId/bracket", getBracket);

// Rutas para goleadores
router.post("/:matchId/scorers", protect, authorizeRoles("admin", "assistant"), addScorers);
router.get("/:tournamentId/scorers", getTournamentScorers);

export default router;
