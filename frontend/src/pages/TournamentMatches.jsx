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
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  CircularProgress,
  Box,
  Paper,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tabs,
  Tab,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DescriptionWithToggle from "../components/matches/DescriptionWithToggle";
import { formatDate, formatTimeTo12h } from "../utils/formatDate";
import EliminationStage from "../components/pairings/EliminationStage";

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
  const [activeTab, setActiveTab] = useState(0);
  const [editingSeriesGame, setEditingSeriesGame] = useState(null);
  const [seriesGameFormData, setSeriesGameFormData] = useState({
    scoreTeam1: "",
    scoreTeam2: "",
  });

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

        if (tournamentData.format === "group-stage") {
          const matchesData = await getMatchesByMatchday(tournamentId);
          setMatchesByMatchday(matchesData);
        } else if (tournamentData.format === "elimination") {
          const bracketData = await getEliminationBracket(tournamentId);
          setBracket(bracketData || {});
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

      const updatedMatch = await addSeriesGameResult(editingMatch._id, {
        scoreTeam1: parseInt(scoreTeam1),
        scoreTeam2: parseInt(scoreTeam2),
      });

      const updatedBracket = { ...bracket };
      Object.keys(updatedBracket).forEach((round) => {
        updatedBracket[round] = updatedBracket[round].map((match) => {
          if (match._id === updatedMatch._id) {
            return updatedMatch;
          }
          return match;
        });
      });

      setBracket(updatedBracket);
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

  const renderSeriesGames = (match) => {
    const canAddMoreGames =
      match.status !== "completed" &&
      (!match.tournament?.bestOfMatches ||
        match.seriesMatches?.length < match.tournament.bestOfMatches);

    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          <strong>Partidos de la serie:</strong>
        </Typography>
        {match.seriesMatches?.map((game, index) => (
          <Box
            key={index}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              mb: 1,
              p: 1,
              backgroundColor: "#f5f5f5",
              borderRadius: 1,
            }}
          >
            <Typography variant="body2">
              Juego {index + 1}: {game.scoreTeam1 ?? "-"} -{" "}
              {game.scoreTeam2 ?? "-"}
            </Typography>
          </Box>
        ))}
        {(user?.role === "admin" || user?.role === "assistant") &&
          canAddMoreGames && (
            <Button
              variant="outlined"
              size="small"
              sx={{ mt: 1 }}
              onClick={() => handleAddSeriesGameClick(match)}
            >
              Agregar Juego
            </Button>
          )}
      </Box>
    );
  };

  const renderEditDialogs = () => {
    if (editingSeriesGame !== null && editingMatch) {
      return (
        <Dialog
          open={true}
          onClose={() => {
            setEditingMatch(null);
            setEditingSeriesGame(null);
          }}
          fullWidth
        >
          <DialogTitle>
            {editingSeriesGame >= 0
              ? `Editar Juego ${editingSeriesGame + 1}`
              : "Agregar Nuevo Juego"}
          </DialogTitle>
          <DialogContent>
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}
            >
              <TextField
                label={`Goles ${editingMatch.team1?.name || "Equipo 1"}`}
                type="number"
                name="scoreTeam1"
                value={seriesGameFormData.scoreTeam1}
                onChange={(e) =>
                  setSeriesGameFormData({
                    ...seriesGameFormData,
                    scoreTeam1: e.target.value,
                  })
                }
                fullWidth
              />
              <TextField
                label={`Goles ${editingMatch.team2?.name || "Equipo 2"}`}
                type="number"
                name="scoreTeam2"
                value={seriesGameFormData.scoreTeam2}
                onChange={(e) =>
                  setSeriesGameFormData({
                    ...seriesGameFormData,
                    scoreTeam2: e.target.value,
                  })
                }
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setEditingMatch(null);
                setEditingSeriesGame(null);
              }}
              color="error"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUpdateSeriesGame}
              color="primary"
              variant="contained"
            >
              Guardar
            </Button>
          </DialogActions>
        </Dialog>
      );
    }

    if (
      editingMatch &&
      (user?.role === "admin" || user?.role === "assistant")
    ) {
      return (
        <Dialog
          open={true}
          onClose={() => setEditingMatch(null)}
          fullWidth
          disableRestoreFocus
        >
          <DialogTitle>
            {`Actualizar: ${editingMatch.team1?.name || "Por definir"} vs ${
              editingMatch.team2?.name || "Por definir"
            }`}
          </DialogTitle>
          <DialogContent>
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}
            >
              {tournament.format === "group-stage" && (
                <>
                  <TextField
                    label={`Goles ${editingMatch.team1?.name || "Equipo 1"}`}
                    type="number"
                    name="scoreTeam1"
                    value={editFormData.scoreTeam1}
                    onChange={handleEditFormChange}
                    fullWidth
                  />
                  <TextField
                    label={`Goles ${editingMatch.team2?.name || "Equipo 2"}`}
                    type="number"
                    name="scoreTeam2"
                    value={editFormData.scoreTeam2}
                    onChange={handleEditFormChange}
                    fullWidth
                  />
                </>
              )}
              <TextField
                label="Fecha"
                type="date"
                name="date"
                value={editFormData.date}
                onChange={handleEditFormChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <TextField
                label="Hora"
                type="time"
                name="time"
                value={editFormData.time}
                onChange={handleEditFormChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <TextField
                label="Descripción"
                name="description"
                value={editFormData.description}
                onChange={handleEditFormChange}
                multiline
                rows={4}
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditingMatch(null)} color="error">
              Cancelar
            </Button>
            <Button
              onClick={handleUpdateMatch}
              color="primary"
              variant="contained"
            >
              Guardar
            </Button>
          </DialogActions>
        </Dialog>
      );
    }

    return null;
  };

  const renderMatchItem = (match, isElimination = false) => (
    <Box
      key={match._id}
      sx={{
        mb: 2,
        p: 2,
        borderBottom: "1px solid #eee",
        "&:last-child": { borderBottom: "none" },
        position: "relative",
      }}
    >
      {(user?.role === "admin" || user?.role === "assistant") && (
        <Button
          size="small"
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
          }}
          onClick={() => handleEditClick(match)}
        >
          Actualizar
        </Button>
      )}

      <Typography variant="h6" gutterBottom>
        {match.team1?.name || "Por definir"} vs{" "}
        {match.team2?.name || "Por definir"}
      </Typography>

      <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
        {!isElimination && (
          <Typography variant="body2">
            <strong>Grupo:</strong> {match.group}
          </Typography>
        )}
        <Typography variant="body2">
          <strong>Estado:</strong> {translateStatus(match.status)}
        </Typography>
        <Typography variant="body2">
          <strong>Fecha:</strong>{" "}
          {match.date ? formatDate(match.date) : "Por definir"}
        </Typography>
        <Typography variant="body2">
          <strong>Hora:</strong>{" "}
          {match.time ? formatTimeTo12h(match.time) : "Por definir"}
        </Typography>
        <DescriptionWithToggle description={match.description} />
        {match.status === "completed" && (
          <Box
            sx={{
              position: "relative",
              top: "-15px",
              px: 2,
              py: 1,
              bgcolor: "#e0f7fa",
              borderRadius: 2,
              border: "1px solid #b2ebf2",
            }}
          >
            <Typography
              variant="body2"
              sx={{ fontWeight: "bold", color: "#00796b" }}
            >
              Resultado: {match.scoreTeam1} - {match.scoreTeam2}
            </Typography>
          </Box>
        )}
      </Box>

      {isElimination && match.seriesMatches && renderSeriesGames(match)}
    </Box>
  );

  const matchdaysArray = Object.entries(matchesByMatchday).map(
    ([matchdayNumber, matches]) => ({
      matchday: matchdayNumber,
      matches,
    })
  );

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
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
        <>
          {matchdaysArray.length === 0 ? (
            <Typography>No hay jornadas programadas</Typography>
          ) : (
            matchdaysArray.map(({ matchday, matches }) => (
              <Accordion
                key={matchday}
                sx={{
                  mb: 2,
                  borderRadius: 2,
                  boxShadow: 2,
                  "&:before": {
                    display: "none",
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    bgcolor: "#f5f5f5",
                    borderRadius: "8px 8px 0 0",
                    "& .MuiTypography-root": { fontWeight: "bold" },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Typography fontWeight="bold">
                      Jornada {matchday}
                    </Typography>
                    <Chip
                      label={`${matches.length} partidos`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  {matches.map((match) => renderMatchItem(match, false))}
                </AccordionDetails>
              </Accordion>
            ))
          )}
        </>
      ) : (
        <Box sx={{ width: "100%" }}>
          <Tabs value={activeTab} onChange={handleTabChange} centered>
            <Tab label="Vista por Rondas" />
            <Tab label="Vista de Bracket" />
          </Tabs>

          {activeTab === 0 ? (
            <>
              {bracket && Object.keys(bracket).length > 0 ? (
                Object.entries(bracket).map(([roundName, matches]) => (
                  <Accordion
                    key={roundName}
                    sx={{
                      mb: 2,
                      borderRadius: 2,
                      boxShadow: 2,
                      "&:before": {
                        display: "none",
                      },
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      sx={{
                        bgcolor: "#f5f5f5",
                        borderRadius: "8px 8px 0 0",
                        "& .MuiTypography-root": { fontWeight: "bold" },
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <Typography fontWeight="bold">
                          {translateRoundName(roundName)}
                        </Typography>
                        <Chip
                          label={`${matches.length} partidos`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      {matches.map((match) => renderMatchItem(match, true))}
                    </AccordionDetails>
                  </Accordion>
                ))
              ) : (
                <Typography sx={{ mt: 2 }}>
                  No hay partidos programados
                </Typography>
              )}
            </>
          ) : (
            <EliminationStage
              user={user}
              bracket={bracket}
              generatingBracket={false}
              generationError={null}
              onGenerateBracket={() => {}}
            />
          )}
        </Box>
      )}

      {renderEditDialogs()}
    </Paper>
  );
};

const translateRoundName = (roundName) => {
  switch (roundName) {
    case "round-of-32":
      return "Dieciseisavos de Final";
    case "round-of-16":
      return "Octavos de Final";
    case "quarter-finals":
      return "Cuartos de Final";
    case "semi-finals":
      return "Semifinales";
    case "final":
      return "Final";
    default:
      return roundName;
  }
};

const translateStatus = (status) => {
  switch (status) {
    case "scheduled":
      return "Programado";
    case "pending":
      return "Pendiente";
    case "in-progress":
      return "En progreso";
    case "completed":
      return "Completado";
    case "postponed":
      return "Aplazado";
    case "cancelled":
      return "Cancelado";
    case "walkover":
      return "Walkover";
    default:
      return status;
  }
};

export default TournamentMatches;
