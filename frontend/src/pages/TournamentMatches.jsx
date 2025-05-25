import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getMatchesByMatchday,
  updateMatchResult,
} from "../services/groupStageService";
import { getUser } from "../services/authService";
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
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DescriptionWithToggle from "../components/matches/DescriptionWithToggle";
import { formatDate, formatTimeTo12h } from "../utils/formatDate";

const TournamentMatches = () => {
  const { tournamentId } = useParams();
  const [matchesByMatchday, setMatchesByMatchday] = useState({});
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

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const data = await getMatchesByMatchday(tournamentId);
        setMatchesByMatchday(data);
      } catch (err) {
        setError("Error al cargar los partidos");
        console.error("Error details:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [tournamentId]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getUser();
        setUser(userData);
      } catch (err) {
        console.error("Error al cargar el usuario:", err);
      }
    };

    fetchUser();
  }, []);

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

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 4, ml: 5, mr: 5 }}>
      <Typography
        variant="h4"
        gutterBottom
        align="center"
        color="primary"
        fontWeight="bold"
      >
        Programación del Torneo
      </Typography>

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
                <Typography fontWeight="bold">Jornada {matchday}</Typography>
                <Chip
                  label={`${matches.length} partidos`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {matches.map((match) => (
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
                    {match.team1.name} vs {match.team2.name}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                    <Typography variant="body2">
                      <strong>Grupo:</strong> {match.group}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Estado:</strong>{" "}
                      {match.status === "scheduled" ? "Programado" : "Jugado"}
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
                </Box>
              ))}
            </AccordionDetails>
          </Accordion>
        ))
      )}

      <Dialog
        open={
          Boolean(editingMatch) &&
          (user?.role === "admin" || user?.role === "assistant")
        }
        onClose={() => setEditingMatch(null)}
        fullWidth
        disableRestoreFocus
      >
        <DialogTitle>
          {editingMatch &&
            `Actualizar: ${editingMatch.team1.name} vs ${editingMatch.team2.name}`}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <TextField
              label={
                editingMatch
                  ? `Goles ${editingMatch.team1.name}`
                  : "Goles Equipo 1"
              }
              type="number"
              name="scoreTeam1"
              value={editFormData.scoreTeam1}
              onChange={handleEditFormChange}
              fullWidth
            />
            <TextField
              label={
                editingMatch
                  ? `Goles ${editingMatch.team2.name}`
                  : "Goles Equipo 2"
              }
              type="number"
              name="scoreTeam2"
              value={editFormData.scoreTeam2}
              onChange={handleEditFormChange}
              fullWidth
            />
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
    </Paper>
  );
};

export default TournamentMatches;
