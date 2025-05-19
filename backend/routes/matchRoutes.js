import express from "express";
import {
  createGroupStage,
  getTournamentMatches,
  getGroupStandings,
  updateMatch,
  getMatchesByMatchday,
  getSingleMatchday,
} from "../controllers/matchController.js";

const router = express.Router();

router.post("/:tournamentId/groups", createGroupStage);
router.get("/:tournamentId/matches", getTournamentMatches);
router.get("/:tournamentId/standings", getGroupStandings);
router.put("/:matchId", updateMatch);
router.get("/:tournamentId/matchdays", getMatchesByMatchday);
router.get("/:tournamentId/matchdays/:matchday", getSingleMatchday);

export default router;
