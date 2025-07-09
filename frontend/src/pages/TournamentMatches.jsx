import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getMatchesByMatchday,
  updateMatchResult,
} from "../services/groupStageService";
import {
  getEliminationBracket,
  addSeriesGameResult,
} from "../services/eliminationStageService";
import { getUser } from "../services/authService";
import { getTournamentById } from "../services/tournamentService";
import { Paper, Typography, CircularProgress, Box } from "@mui/material";
import GroupStageMatches from "../components/matches/GroupStageMatches";
import EliminationStageMatches from "../components/matches/EliminationStageMatches";
import EditMatchDialog from "../components/matches/EditMatchDialog";
import SeriesGameDialog from "../components/matches/SeriesGameDialog";
import { getTournamentScorers, isScorersSupported } from "../services/scorersService";

const TournamentMatches = () => {
  const { tournamentId } = useParams();
  const [matchesByMatchday, setMatchesByMatchday] = useState({});
  const [bracket, setBracket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingMatch, setEditingMatch] = useState(null);
  const [editFormData, setEditFormData] = useState({
    scoreTeam1: "",
    scoreTeam2: "",
    date: "",
    time: "",
    description: "",
  });
  const [user, setUser] = useState(null);
  const [tournament, setTournament] = useState(null);
  const [editingSeriesGame, setEditingSeriesGame] = useState(null);
  const [seriesGameFormData, setSeriesGameFormData] = useState({
    scoreTeam1: "",
    scoreTeam2: "",
  });
  const [scorersData, setScorersData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [tournamentData, userData] = await Promise.all([
          getTournamentById(tournamentId),
          getUser(),
        ]);
        setTournament(tournamentData);
        setUser(userData);

        const supportsScorers = isScorersSupported(tournamentData.sport?.name);

        if (tournamentData.format === "group-stage") {
          const promises = [getMatchesByMatchday(tournamentId)];
          
          if (supportsScorers) {
            promises.push(getTournamentScorers(tournamentId));
          }
          
          const results = await Promise.all(promises);
          setMatchesByMatchday(results[0]);
          setScorersData(supportsScorers ? results[1] : null);
        } else if (tournamentData.format === "elimination") {
          const promises = [getEliminationBracket(tournamentId)];
          
          if (supportsScorers) {
            promises.push(getTournamentScorers(tournamentId));
          }
          
          const results = await Promise.all(promises);
          setBracket(results[0] || {});
          setScorersData(supportsScorers ? results[1] : null);
        }
      } catch (err) {
        setError("Error al cargar los datos del torneo");
        console.error("Error details:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tournamentId]);

  const handleAddSeriesGameClick = (match) => {
    setEditingMatch(match);
    setEditingSeriesGame(-1);
    setSeriesGameFormData({
      scoreTeam1: "",
      scoreTeam2: "",
    });
  };

  const handleUpdateSeriesGame = async () => {
    try {
      const { scoreTeam1, scoreTeam2 } = seriesGameFormData;

      if (scoreTeam1 === "" || scoreTeam2 === "") {
        throw new Error("Los scores no pueden estar vacíos");
      }

      await addSeriesGameResult(editingMatch._id, {
        scoreTeam1: parseInt(scoreTeam1),
        scoreTeam2: parseInt(scoreTeam2),
      });

      // Volver a pedir el bracket actualizado al backend
      const freshBracket = await getEliminationBracket(tournamentId);
      setBracket(freshBracket || {});
      if (typeof refreshScorersData === 'function') {
        await refreshScorersData();
      }
      setEditingMatch(null);
      setEditingSeriesGame(null);
    } catch (error) {
      console.error("Error updating series game:", error);
      setError(error.message || "Error al actualizar el juego de la serie");
    }
  };

  const handleEditClick = (match) => {
    setEditingMatch(match);
    setEditFormData({
      scoreTeam1: match.scoreTeam1 || "",
      scoreTeam2: match.scoreTeam2 || "",
      date: match.date ? match.date.split("T")[0] : "",
      time: match.time || "",
      description: match.description || "",
    });
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value,
    });
  };

  const handleUpdateMatch = async () => {
    try {
      const updateData = Object.fromEntries(
        Object.entries(editFormData).filter(
          ([key, value]) => value !== "" && value !== editingMatch[key]
        )
      );

      if (Object.keys(updateData).length > 0) {
        await updateMatchResult(editingMatch._id, updateData);

        if (tournament.format === "group-stage") {
          const updatedMatchesByMatchday = { ...matchesByMatchday };
          Object.keys(updatedMatchesByMatchday).forEach((matchday) => {
            updatedMatchesByMatchday[matchday] = updatedMatchesByMatchday[
              matchday
            ].map((match) => {
              if (match._id === editingMatch._id) {
                return {
                  ...match,
                  ...updateData,
                  ...(updateData.scoreTeam1 !== undefined &&
                  updateData.scoreTeam2 !== undefined
                    ? {
                        winner:
                          updateData.scoreTeam1 > updateData.scoreTeam2
                            ? match.team1
                            : updateData.scoreTeam1 < updateData.scoreTeam2
                            ? match.team2
                            : null,
                        status: "completed",
                      }
                    : {}),
                };
              }
              return match;
            });
          });
          setMatchesByMatchday(updatedMatchesByMatchday);
        } else if (tournament.format === "elimination") {
          const updatedBracket = { ...bracket };
          Object.keys(updatedBracket).forEach((round) => {
            updatedBracket[round] = updatedBracket[round].map((match) => {
              if (match._id === editingMatch._id) {
                const updatedMatch = {
                  ...match,
                  ...updateData,
                };

                if (
                  updateData.scoreTeam1 !== undefined &&
                  updateData.scoreTeam2 !== undefined
                ) {
                  updatedMatch.status = "completed";
                  updatedMatch.winner =
                    updateData.scoreTeam1 > updateData.scoreTeam2
                      ? match.team1
                      : updateData.scoreTeam1 < updateData.scoreTeam2
                      ? match.team2
                      : null;
                }

                return updatedMatch;
              }
              return match;
            });
          });
          setBracket(updatedBracket);
        }
      }

      setEditingMatch(null);
    } catch (error) {
      console.error("Error al actualizar el partido:", error);
      setError("Error al actualizar el partido");
    }
  };

  const matchdaysArray = Object.entries(matchesByMatchday).map(
    ([matchdayNumber, matches]) => ({
      matchday: matchdayNumber,
      matches,
    })
  );

  const refreshScorersData = async () => {
    try {
      if (tournament && isScorersSupported(tournament.sport?.name)) {
        const scorers = await getTournamentScorers(tournamentId);
        setScorersData(scorers);
      }
    } catch (err) {
      console.error("Error al refrescar la tabla de goleadores:", err);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!tournament) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <Typography>Torneo no encontrado</Typography>
      </Box>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 4, ml: 5, mr: 5 }}>
      <Typography
        variant="h4"
        gutterBottom
        align="center"
        color="primary"
        fontWeight="bold"
      >
        Programación del Torneo: {tournament.name}
      </Typography>

      {tournament.format === "group-stage" ? (
        <GroupStageMatches
          matchdaysArray={matchdaysArray}
          user={user}
          onEditClick={handleEditClick}
          scorersData={scorersData}
          refreshScorersData={refreshScorersData}
          sportName={tournament.sport?.name}
        />
      ) : (
        <EliminationStageMatches
          bracket={bracket}
          user={user}
          onEditClick={handleEditClick}
          onAddSeriesGame={handleAddSeriesGameClick}
          scorersData={scorersData}
          refreshScorersData={refreshScorersData}
          sportName={tournament.sport?.name}
        />
      )}

      <EditMatchDialog
        open={editingMatch !== null && editingSeriesGame === null}
        onClose={() => setEditingMatch(null)}
        match={editingMatch}
        tournamentFormat={tournament?.format}
        formData={editFormData}
        onFormChange={handleEditFormChange}
        onSubmit={handleUpdateMatch}
      />

      <SeriesGameDialog
        open={editingSeriesGame !== null}
        onClose={() => {
          setEditingMatch(null);
          setEditingSeriesGame(null);
        }}
        match={editingMatch}
        formData={seriesGameFormData}
        onFormChange={(e) =>
          setSeriesGameFormData({
            ...seriesGameFormData,
            [e.target.name]: e.target.value,
          })
        }
        onSubmit={handleUpdateSeriesGame}
      />
    </Paper>
  );
};

export default TournamentMatches;
