import Team from "../models/teamModel.js";
import Player from "../models/playerModel.js";
import Tournament from "../models/tournamentModel.js";
import mongoose from "mongoose";

export const registerTeam = async (req, res) => {
  try {
    const { name, tournamentId, players, captainExtra } = req.body;
    const captainUser = req.user;

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament)
      return res.status(404).json({ message: "Tournament not found" });

    if (tournament.status !== "registration open") {
      return res.status(400).json({ message: "Out of dates for registration" });
    }

    const existingTeams = await Team.find({
      tournament: tournamentId,
    }).populate("players");

    if (existingTeams.length >= tournament.maxTeams) {
      return res.status(400).json({
        message: `The maximum number of teams (${tournament.maxTeams}) has already been registered for this tournament.`,
      });
    }

    const playerIds = [];

    const fullName = `${captainUser.firstName} ${captainUser.lastName}`;
    let captainPlayer = await Player.findOne({
      $or: [{ idNumber: captainExtra.idNumber }, { email: captainUser.email }],
    });

    if (!captainPlayer) {
      captainPlayer = await Player.create({
        fullName,
        idNumber: captainExtra.idNumber,
        email: captainUser.email,
        eps: captainExtra.eps,
        career: captainExtra.career,
      });
    } else {
      captainPlayer.fullName = fullName;
      captainPlayer.eps = captainExtra.eps;
      captainPlayer.career = captainExtra.career;
      await captainPlayer.save();
    }

    const alreadyCaptainInTeam = existingTeams.some((team) =>
      team.players.some((player) => player._id.equals(captainPlayer._id))
    );
    if (alreadyCaptainInTeam) {
      return res.status(400).json({
        message: `Captain ${fullName} is already registered for this tournament as a player`,
      });
    }

    playerIds.push(captainPlayer._id);

    for (const p of players) {
      let existingPlayer = await Player.findOne({
        $or: [{ idNumber: p.idNumber }, { email: p.email }],
      });

      if (!existingPlayer) {
        existingPlayer = await Player.create({
          fullName: p.fullName,
          idNumber: p.idNumber,
          email: p.email,
          eps: p.eps,
          career: p.career,
        });
      } else {
        existingPlayer.fullName = p.fullName;
        existingPlayer.eps = p.eps;
        existingPlayer.career = p.career;
        await existingPlayer.save();
      }

      const alreadyInTeam = existingTeams.some((team) =>
        team.players.some((player) => player._id.equals(existingPlayer._id))
      );

      if (alreadyInTeam) {
        return res.status(400).json({
          message: `Player ${p.fullName} is already registered for this tournament`,
        });
      }

      playerIds.push(existingPlayer._id);
    }

    const totalPlayers = playerIds.length;
    if (
      totalPlayers < tournament.minPlayersPerTeam ||
      totalPlayers > tournament.maxPlayersPerTeam
    ) {
      return res.status(400).json({
        message: `The number of players (including captain) must be between ${tournament.minPlayersPerTeam} and ${tournament.maxPlayersPerTeam}`,
      });
    }

    const newTeam = await Team.create({
      name,
      tournament: tournamentId,
      captain: captainUser._id,
      players: playerIds,
    });

    res.status(201).json({
      message: "Team successfully registered",
      team: newTeam,
    });
  } catch (error) {
    console.error("Error registering team:", error);
    res.status(500).json({ message: "Error registering team" });
  }
};

export const removePlayerFromTeam = async (req, res) => {
  try {
    const { teamId, playerId } = req.body;
    const currentDate = new Date();

    const team = await Team.findById(teamId).populate("tournament players");
    if (!team) return res.status(404).json({ message: "Team not found" });

    if (
      currentDate < team.tournament.registrationStart ||
      currentDate > team.tournament.registrationPlayerEnd
    ) {
      return res.status(400).json({
        message:
          "Player modifications are only allowed between registration start and player registration end dates",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(playerId)) {
      return res.status(400).json({ message: "Invalid player ID" });
    }

    if (!team.players.some((p) => p._id.equals(playerId))) {
      return res.status(400).json({ message: "Player is not in the team" });
    }

    if (team.players.length <= team.tournament.minPlayersPerTeam) {
      return res.status(400).json({
        message: `Cannot remove player. Team must have at least ${team.tournament.minPlayersPerTeam} players.`,
      });
    }

    team.players = team.players.filter((p) => !p._id.equals(playerId));
    await team.save();

    res.status(200).json({ message: "Player removed from team", team });
  } catch (error) {
    console.error("Error removing player:", error);
    res.status(500).json({ message: "Error removing player from team" });
  }
};

export const addPlayersToTeam = async (req, res) => {
  try {
    const { teamId, newPlayers } = req.body;
    const currentDate = new Date();

    const team = await Team.findById(teamId).populate("tournament players");

    if (!team) return res.status(404).json({ message: "Team not found" });

    if (
      req.user.role === "captain" &&
      team.captain.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "You are not authorized to modify this team",
      });
    }

    if (
      currentDate < team.tournament.registrationStart ||
      currentDate > team.tournament.registrationPlayerEnd
    ) {
      return res.status(400).json({
        message:
          "Player modifications are only allowed between registration start and player registration end dates",
      });
    }

    const existingTeams = await Team.find({
      tournament: team.tournament._id,
    }).populate("players");

    const playerIdsToAdd = [];

    for (const p of newPlayers) {
      let player = await Player.findOne({
        $or: [{ idNumber: p.idNumber }, { email: p.email }],
      });

      if (!player) {
        player = await Player.create({
          fullName: p.fullName,
          idNumber: p.idNumber,
          email: p.email,
          eps: p.eps,
          career: p.career,
        });
      }

      const alreadyInOtherTeam = existingTeams.some(
        (t) =>
          t._id.toString() !== teamId &&
          t.players.some((playerInTeam) => playerInTeam._id.equals(player._id))
      );
      if (alreadyInOtherTeam) {
        return res.status(400).json({
          message: `Player ${p.fullName} is already in another team in this tournament`,
        });
      } else {
        player.fullName = p.fullName;
        player.eps = p.eps;
        player.career = p.career;
        await player.save();
      }

      if (team.players.some((pl) => pl._id.equals(player._id))) {
        continue;
      }

      playerIdsToAdd.push(player._id);
    }

    const totalAfterAdd = team.players.length + playerIdsToAdd.length;
    if (totalAfterAdd > team.tournament.maxPlayersPerTeam) {
      return res.status(400).json({
        message: `Cannot add players. Maximum allowed is ${team.tournament.maxPlayersPerTeam}`,
      });
    }

    team.players.push(...playerIdsToAdd);
    await team.save();

    res.status(200).json({ message: "Players added to team", team });
  } catch (error) {
    console.error("Error adding players:", error);
    res.status(500).json({ message: "Error adding players to team" });
  }
};

export const getTeamsByTournament = async (req, res) => {
  try {
    const { tournamentId } = req.params;

    const teams = await Team.find({ tournament: tournamentId })
      .populate("captain", "firstName lastName email")
      .populate("players");

    res.status(200).json({ teams });
  } catch (error) {
    console.error("Error getting teams by tournament:", error);
    res.status(500).json({ message: "Error retrieving teams by tournament" });
  }
};

export const getTeamById = async (req, res) => {
  try {
    const { teamId } = req.params;

    const team = await Team.findById(teamId)
      .populate("captain", "firstName lastName email")
      .populate("players")
      .populate("tournament");

    if (!team) return res.status(404).json({ message: "Team not found" });

    res.status(200).json({ team });
  } catch (error) {
    console.error("Error getting team by ID:", error);
    res.status(500).json({ message: "Error retrieving team" });
  }
};
