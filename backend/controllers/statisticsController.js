/**
 * @file statisticsController.js
 * @module controllers/statisticsController
 * @description Controller for admin statistics and analytics
 */

import Tournament from "../models/tournamentModel.js";
import Team from "../models/teamModel.js";
import Player from "../models/playerModel.js";
import Match from "../models/matchModel.js";
import User from "../models/userModel.js";
import Sport from "../models/sportModel.js";
import TeamChangeLog from "../models/teamChangeLogModel.js";
import asyncHandler from "express-async-handler";

/**
 * @function getDashboardStats
 * @desc Get general dashboard statistics
 * @route GET /api/statistics/dashboard
 * @access Private (Admin only)
 */
export const getDashboardStats = asyncHandler(async (req, res) => {
  try {
    // Total counts
    const totalTournaments = await Tournament.countDocuments();
    const totalTeams = await Team.countDocuments();
    const totalPlayers = await Player.countDocuments();
    const totalMatches = await Match.countDocuments({ status: "completed" });
    const totalUsers = await User.countDocuments();

    // Tournaments by status
    const tournamentsByStatus = await Tournament.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Active tournaments (in progress or registration open)
    const activeTournaments = await Tournament.countDocuments({
      status: { $in: ["registration open", "in progress", "player adjustment"] },
    });

    // Completed tournaments
    const completedTournaments = await Tournament.countDocuments({
      status: "completed",
    });

    // Upcoming tournaments
    const upcomingTournaments = await Tournament.countDocuments({
      status: "coming soon",
    });

    // Users by role
    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      overview: {
        totalTournaments,
        totalTeams,
        totalPlayers,
        totalMatches,
        totalUsers,
        activeTournaments,
        completedTournaments,
        upcomingTournaments,
      },
      tournamentsByStatus,
      usersByRole,
    });
  } catch (error) {
    res.status(500);
    throw new Error("Error fetching dashboard statistics: " + error.message);
  }
});

/**
 * @function getTournamentStats
 * @desc Get detailed tournament statistics
 * @route GET /api/statistics/tournaments
 * @access Private (Admin only)
 */
export const getTournamentStats = asyncHandler(async (req, res) => {
  try {
    // Tournaments by sport
    const tournamentsBySport = await Tournament.aggregate([
      {
        $lookup: {
          from: "sports",
          localField: "sport",
          foreignField: "_id",
          as: "sportInfo",
        },
      },
      {
        $unwind: "$sportInfo",
      },
      {
        $group: {
          _id: "$sportInfo.name",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    // Tournaments by format
    const tournamentsByFormat = await Tournament.aggregate([
      {
        $group: {
          _id: "$format",
          count: { $sum: 1 },
        },
      },
    ]);

    // Olympiad vs Regular
    const olympiadStats = await Tournament.aggregate([
      {
        $group: {
          _id: "$isOlympiad",
          count: { $sum: 1 },
        },
      },
    ]);

    // Average teams per tournament
    const avgTeamsPerTournament = await Team.aggregate([
      {
        $group: {
          _id: "$tournament",
          teamCount: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: null,
          avgTeams: { $avg: "$teamCount" },
        },
      },
    ]);

    // Tournament occupancy rate (teams registered / max teams)
    const tournamentOccupancy = await Tournament.aggregate([
      {
        $lookup: {
          from: "teams",
          localField: "_id",
          foreignField: "tournament",
          as: "teams",
        },
      },
      {
        $project: {
          name: 1,
          maxTeams: 1,
          registeredTeams: { $size: "$teams" },
          occupancyRate: {
            $multiply: [
              { $divide: [{ $size: "$teams" }, "$maxTeams"] },
              100,
            ],
          },
        },
      },
      {
        $sort: { occupancyRate: -1 },
      },
    ]);

    // Monthly tournament creation trend (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const monthlyTournaments = await Tournament.aggregate([
      {
        $match: {
          createdAt: { $gte: twelveMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]);

    res.json({
      tournamentsBySport,
      tournamentsByFormat,
      olympiadStats,
      avgTeamsPerTournament: avgTeamsPerTournament[0]?.avgTeams || 0,
      tournamentOccupancy,
      monthlyTournaments,
    });
  } catch (error) {
    res.status(500);
    throw new Error("Error fetching tournament statistics: " + error.message);
  }
});

/**
 * @function getParticipationStats
 * @desc Get participation statistics (teams and players)
 * @route GET /api/statistics/participation
 * @access Private (Admin only)
 */
export const getParticipationStats = asyncHandler(async (req, res) => {
  try {
    // Players by career (top careers)
    const playersByCareer = await Player.aggregate([
      {
        $group: {
          _id: "$career",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    // Average players per team
    const avgPlayersPerTeam = await Team.aggregate([
      {
        $project: {
          playerCount: { $size: "$players" },
        },
      },
      {
        $group: {
          _id: null,
          avgPlayers: { $avg: "$playerCount" },
        },
      },
    ]);

    // Team size distribution
    const teamSizeDistribution = await Team.aggregate([
      {
        $project: {
          playerCount: { $size: "$players" },
        },
      },
      {
        $group: {
          _id: "$playerCount",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Teams with most changes
    const teamsWithMostChanges = await TeamChangeLog.aggregate([
      {
        $group: {
          _id: "$team",
          changeCount: { $sum: 1 },
        },
      },
      {
        $sort: { changeCount: -1 },
      },
      {
        $limit: 10,
      },
      {
        $lookup: {
          from: "teams",
          localField: "_id",
          foreignField: "_id",
          as: "teamInfo",
        },
      },
      {
        $unwind: "$teamInfo",
      },
      {
        $project: {
          teamName: "$teamInfo.name",
          changeCount: 1,
        },
      },
    ]);

    // Change log statistics
    const changeLogStats = await TeamChangeLog.aggregate([
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
        },
      },
    ]);

    // Monthly player registration trend
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const monthlyPlayers = await Player.aggregate([
      {
        $match: {
          createdAt: { $gte: twelveMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]);

    res.json({
      playersByCareer,
      avgPlayersPerTeam: avgPlayersPerTeam[0]?.avgPlayers || 0,
      teamSizeDistribution,
      teamsWithMostChanges,
      changeLogStats,
      monthlyPlayers,
    });
  } catch (error) {
    res.status(500);
    throw new Error("Error fetching participation statistics: " + error.message);
  }
});

/**
 * @function getSportsStats
 * @desc Get sports and match statistics
 * @route GET /api/statistics/sports
 * @access Private (Admin only)
 */
export const getSportsStats = asyncHandler(async (req, res) => {
  try {
    // Top scorers (all-time for football sports)
    const topScorers = await Match.aggregate([
      { $unwind: "$scorers" },
      {
        $group: {
          _id: "$scorers.playerId",
          totalGoals: { $sum: "$scorers.goals" },
        },
      },
      { $sort: { totalGoals: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "players",
          localField: "_id",
          foreignField: "_id",
          as: "playerInfo",
        },
      },
      { $unwind: "$playerInfo" },
      {
        $project: {
          playerName: "$playerInfo.fullName",
          totalGoals: 1,
        },
      },
    ]);

    // Best goalkeepers (clean sheets)
    const bestGoalkeepers = await Match.aggregate([
      { $unwind: "$goalkeepers" },
      {
        $group: {
          _id: "$goalkeepers.playerId",
          cleanSheets: {
            $sum: { $cond: ["$goalkeepers.isCleanSheet", 1, 0] },
          },
          totalGoalsAgainst: { $sum: "$goalkeepers.goalsAgainst" },
          matchesPlayed: { $sum: 1 },
        },
      },
      { $sort: { cleanSheets: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "players",
          localField: "_id",
          foreignField: "_id",
          as: "playerInfo",
        },
      },
      { $unwind: "$playerInfo" },
      {
        $project: {
          playerName: "$playerInfo.fullName",
          cleanSheets: 1,
          totalGoalsAgainst: 1,
          matchesPlayed: 1,
          avgGoalsAgainst: {
            $round: [{ $divide: ["$totalGoalsAgainst", "$matchesPlayed"] }, 2],
          },
        },
      },
    ]);

    // Match statistics by status
    const matchesByStatus = await Match.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Matches by round
    const matchesByRound = await Match.aggregate([
      {
        $group: {
          _id: "$round",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    // Average goals per match (football sports only)
    const avgGoalsPerMatch = await Match.aggregate([
      {
        $match: {
          status: "completed",
          scoreTeam1: { $exists: true, $ne: null },
          scoreTeam2: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: null,
          avgGoals: {
            $avg: { $add: ["$scoreTeam1", "$scoreTeam2"] },
          },
        },
      },
    ]);

    // Sports popularity (by teams registered)
    const sportsPopularity = await Team.aggregate([
      {
        $lookup: {
          from: "tournaments",
          localField: "tournament",
          foreignField: "_id",
          as: "tournamentInfo",
        },
      },
      { $unwind: "$tournamentInfo" },
      {
        $lookup: {
          from: "sports",
          localField: "tournamentInfo.sport",
          foreignField: "_id",
          as: "sportInfo",
        },
      },
      { $unwind: "$sportInfo" },
      {
        $group: {
          _id: "$sportInfo.name",
          teamCount: { $sum: 1 },
        },
      },
      { $sort: { teamCount: -1 } },
    ]);

    res.json({
      topScorers,
      bestGoalkeepers,
      matchesByStatus,
      matchesByRound,
      avgGoalsPerMatch: avgGoalsPerMatch[0]?.avgGoals || 0,
      sportsPopularity,
    });
  } catch (error) {
    res.status(500);
    throw new Error("Error fetching sports statistics: " + error.message);
  }
});

/**
 * @function getActivityStats
 * @desc Get activity and changelog statistics
 * @route GET /api/statistics/activity
 * @access Private (Admin only)
 */
export const getActivityStats = asyncHandler(async (req, res) => {
  try {
    // Total changes by type
    const changesByType = await TeamChangeLog.aggregate([
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
        },
      },
    ]);

    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentActivity = await TeamChangeLog.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Most active captains
    const activeCaptains = await Team.aggregate([
      {
        $group: {
          _id: "$captain",
          teamCount: { $sum: 1 },
        },
      },
      { $sort: { teamCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "captainInfo",
        },
      },
      { $unwind: "$captainInfo" },
      {
        $project: {
          captainName: {
            $concat: [
              "$captainInfo.firstName",
              " ",
              "$captainInfo.lastName",
            ],
          },
          teamCount: 1,
        },
      },
    ]);

    res.json({
      changesByType,
      recentActivity,
      activeCaptains,
    });
  } catch (error) {
    res.status(500);
    throw new Error("Error fetching activity statistics: " + error.message);
  }
});
