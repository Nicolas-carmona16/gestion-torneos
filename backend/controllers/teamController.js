import Team from "../models/teamModel.js";
import Player from "../models/playerModel.js";
import Tournament from "../models/tournamentModel.js";
import mongoose from "mongoose";
import { supabase } from "../config/supabase.js";
import { getNowInColombia, getDateFromUTC } from "../utils/dateUtils.js";

async function uploadEPSToSupabase(file, fileName) {
  if (file.mimetype !== "application/pdf") {
    throw new Error("Only PDF files are allowed for EPS documents");
  }

  const filePath = `eps_documents/${fileName}.pdf`;

  const { data, error } = await supabase.storage
    .from("eps-documents")
    .upload(filePath, file.buffer, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (error) {
    throw new Error(`Failed to upload EPS document: ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("eps-documents").getPublicUrl(data.path);

  return publicUrl;
}

/**
 * Valida si las modificaciones de jugadores están permitidas
 * @param {Object} tournament - Objeto torneo con fechas
 * @returns {boolean} - true si se pueden modificar jugadores
 */
const canModifyPlayers = (tournament) => {
  if (!tournament || !tournament.registrationStart || !tournament.registrationPlayerEnd) {
    return false;
  }

  const now = getNowInColombia();
  const registrationStart = getDateFromUTC(tournament.registrationStart);
  const registrationEnd = getDateFromUTC(tournament.registrationPlayerEnd);

  // Configurar horas para comparación
  now.setHours(12, 0, 0, 0); // Mediodía para evitar problemas de borde
  registrationStart.setHours(0, 0, 0, 0); // Inicio del día
  registrationEnd.setHours(23, 59, 59, 999); // Final del día

  return now >= registrationStart && now <= registrationEnd;
};

export const registerTeam = async (req, res) => {
  try {
    const { name, tournamentId, players, captainExtra } = req.body;
    const captainUser = req.user;

    const captainEPSFile = req.files?.captainEPS?.[0];
    const playersEPSFiles = req.files?.playersEPS || [];

    if (!captainEPSFile || playersEPSFiles.length !== players.length) {
      return res
        .status(400)
        .json({ message: "EPS documents are required for all players" });
    }

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }

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
    const timestamp = Date.now();

    const captainEPSUrl = await uploadEPSToSupabase(
      captainEPSFile,
      `captain_${captainExtra.idNumber}_${timestamp}`
    );

    let captainPlayer = await Player.findOne({
      $or: [{ idNumber: captainExtra.idNumber }, { email: captainUser.email }],
    });

    if (!captainPlayer) {
      captainPlayer = await Player.create({
        fullName,
        idNumber: captainExtra.idNumber,
        email: captainUser.email,
        eps: {
          url: captainEPSUrl,
          fileName: `captain_${captainExtra.idNumber}_${timestamp}.pdf`,
        },
        career: captainExtra.career,
      });
    } else {
      captainPlayer.fullName = fullName;
      captainPlayer.eps = {
        url: captainEPSUrl,
        fileName: `captain_${captainUser.idNumber}_${timestamp}.pdf`,
      };
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

    for (let i = 0; i < players.length; i++) {
      const p = players[i];
      const playerEPSFile = playersEPSFiles[i];

      const playerEPSUrl = await uploadEPSToSupabase(
        playerEPSFile,
        `player_${p.idNumber}_${timestamp}`
      );

      let existingPlayer = await Player.findOne({
        $or: [{ idNumber: p.idNumber }, { email: p.email }],
      });

      if (!existingPlayer) {
        existingPlayer = await Player.create({
          fullName: p.fullName,
          idNumber: p.idNumber,
          email: p.email,
          eps: {
            url: playerEPSUrl,
            fileName: `player_${p.idNumber}_${timestamp}.pdf`,
          },
          career: p.career,
        });
      } else {
        existingPlayer.fullName = p.fullName;
        existingPlayer.eps = {
          url: playerEPSUrl,
          fileName: `player_${p.idNumber}_${timestamp}.pdf`,
        };
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
    res.status(500).json({
      message: "Error registering team",
      error: error.message,
    });
  }
};

export const removePlayerFromTeam = async (req, res) => {
  try {
    const { teamId, playerId } = req.body;

    const team = await Team.findById(teamId).populate("tournament players");
    if (!team) return res.status(404).json({ message: "Team not found" });

    if (!canModifyPlayers(team.tournament)) {
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

    // Find the player to be removed
    const playerToRemove = team.players.find((p) => p._id.equals(playerId));
    
    // Remove player from active players
    team.players = team.players.filter((p) => !p._id.equals(playerId));
    
    // Add player to removed players history
    team.removedPlayers.push({
      player: playerId,
      removedAt: new Date(),
      removedBy: req.user._id,
    });
    
    await team.save();

    res.status(200).json({ 
      message: "Player removed from team", 
      team,
      removedPlayer: playerToRemove 
    });
  } catch (error) {
    console.error("Error removing player:", error);
    res.status(500).json({ message: "Error removing player from team" });
  }
};

export const addPlayersToTeam = async (req, res) => {
  try {
    const { teamId, newPlayers } = req.body;
    const playerEPSFile = req.file;

    if (!playerEPSFile || playerEPSFile.mimetype !== "application/pdf") {
      return res.status(400).json({
        message: "A valid EPS PDF document is required for the new player",
      });
    }

    const team = await Team.findById(teamId).populate("tournament players");

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    if (
      req.user.role === "captain" &&
      team.captain.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "You are not authorized to modify this team",
      });
    }

    if (!canModifyPlayers(team.tournament)) {
      return res.status(400).json({
        message:
          "Player modifications are only allowed between registration start and player registration end dates",
      });
    }

    const existingTeams = await Team.find({
      tournament: team.tournament._id,
    }).populate("players");

    const playerIdsToAdd = [];

    const newPlayer = newPlayers[0];

    const timestamp = new Date().toISOString().replace(/[-:.]/g, "");
    const playerEPSUrl = await uploadEPSToSupabase(
      playerEPSFile,
      `player_${newPlayer.idNumber}_${timestamp}`
    );

    let player = await Player.findOne({
      $or: [{ idNumber: newPlayer.idNumber }, { email: newPlayer.email }],
    });

    if (!player) {
      player = await Player.create({
        fullName: newPlayer.fullName,
        idNumber: newPlayer.idNumber,
        email: newPlayer.email,
        eps: {
          url: playerEPSUrl,
          fileName: `player_${newPlayer.idNumber}.pdf`,
        },
        career: newPlayer.career,
      });
    } else {
      player.fullName = newPlayer.fullName;
      player.eps = {
        url: playerEPSUrl,
        fileName: `player_${newPlayer.idNumber}.pdf`,
      };
      player.career = newPlayer.career;
      await player.save();
    }

    const alreadyInOtherTeam = existingTeams.some(
      (t) =>
        t._id.toString() !== teamId &&
        t.players.some((playerInTeam) => playerInTeam._id.equals(player._id))
    );

    if (alreadyInOtherTeam) {
      return res.status(400).json({
        message: `Player ${newPlayer.fullName} is already in another team in this tournament`,
      });
    }

    if (team.players.some((pl) => pl._id.equals(player._id))) {
      return res.status(400).json({
        message: `Player ${newPlayer.fullName} is already in this team`,
      });
    }

    const wasRemoved = team.removedPlayers.some((rp) => rp.player.equals(player._id));
    if (wasRemoved) {
      team.removedPlayers = team.removedPlayers.filter((rp) => !rp.player.equals(player._id));
    }

    playerIdsToAdd.push(player._id);

    const totalAfterAdd = team.players.length + playerIdsToAdd.length;
    if (totalAfterAdd > team.tournament.maxPlayersPerTeam) {
      return res.status(400).json({
        message: `Cannot add players. Maximum allowed is ${team.tournament.maxPlayersPerTeam}`,
      });
    }

    team.players.push(...playerIdsToAdd);
    await team.save();

    res.status(200).json({
      message: wasRemoved 
        ? "Player re-added to team successfully (removed from eliminated list)" 
        : "Player added to team successfully",
      team,
      playerDetails: {
        id: player._id,
        fullName: player.fullName,
        epsDocument: player.eps.url,
        wasReAdded: wasRemoved,
      },
    });
  } catch (error) {
    console.error("Error adding player:", error);
    res.status(500).json({
      message: "Error adding player to team",
      error: error.message,
    });
  }
};

export const updateTeamName = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { name } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: "El nombre del equipo es requerido" });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Equipo no encontrado" });
    }

    const existingTeam = await Team.findOne({
      tournament: team.tournament,
      name: name.trim(),
      _id: { $ne: teamId }
    });

    if (existingTeam) {
      return res.status(400).json({ 
        message: "Ya existe un equipo con ese nombre en este torneo" 
      });
    }

    team.name = name.trim();
    await team.save();

    res.status(200).json({
      message: "Nombre del equipo actualizado exitosamente",
      team
    });
  } catch (error) {
    console.error("Error updating team name:", error);
    res.status(500).json({
      message: "Error al actualizar el nombre del equipo",
      error: error.message,
    });
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
      .populate("tournament")
      .populate({
        path: "removedPlayers.player",
        select: "fullName idNumber email career"
      })
      .populate({
        path: "removedPlayers.removedBy",
        select: "firstName lastName"
      });

    if (!team) return res.status(404).json({ message: "Team not found" });

    res.status(200).json({ team });
  } catch (error) {
    console.error("Error getting team by ID:", error);
    res.status(500).json({ message: "Error retrieving team" });
  }
};
