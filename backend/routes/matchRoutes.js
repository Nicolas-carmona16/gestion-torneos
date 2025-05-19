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
} from "../controllers/matchController.js";

const router = express.Router();

router.post("/:tournamentId/groups", createGroupStage);
router.get("/:tournamentId/matches", getTournamentMatches);
router.get("/:tournamentId/standings", getGroupStandings);
router.put("/:matchId", updateMatch);
router.get("/:tournamentId/matchdays", getMatchesByMatchday);
router.get("/:tournamentId/matchdays/:matchday", getSingleMatchday);
router.post("/:tournamentId/elimination", createEliminationBracket);
router.post("/:tournamentId/playoff", createPlayoffBracket);
router.post("/:matchId/series", addSeriesGameResult);
router.get("/:tournamentId/bracket", getBracket);

export default router;
