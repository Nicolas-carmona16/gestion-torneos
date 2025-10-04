import { useState, useEffect } from "react";
import {
  Box,
  Modal,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Divider,
  Alert,
  CircularProgress,
} from "@mui/material";
import { addScorersToMatch } from "../../services/scorersService";
import { getTeamPlayers } from "../../services/teamService";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  maxWidth: "90vw",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
  maxHeight: "90vh",
  overflowY: "auto",
};

const AddScorersModal = ({ open, onClose, match, fetchMatchDetails, refreshScorersData }) => {
  const [team1Players, setTeam1Players] = useState([]);
  const [team2Players, setTeam2Players] = useState([]);
  const [scorers, setScorers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Cargar jugadores de los equipos al abrir el modal
  useEffect(() => {
    if (open && match) {
      const fetchPlayersAndScorers = async () => {
        try {
          setLoading(true);
          setError(null);

          // Obtener jugadores de ambos equipos
          const [team1Data, team2Data] = await Promise.all([
            getTeamPlayers(match.team1._id),
            getTeamPlayers(match.team2._id)
          ]);

          setTeam1Players(team1Data);
          setTeam2Players(team2Data);

          // Si hay goleadores existentes, cargarlos
          if (match.scorers && match.scorers.length > 0) {
            setScorers(match.scorers.map(s => ({
              playerId: s.playerId._id || s.playerId,
              teamId: s.teamId._id || s.teamId,
              goals: s.goals
            })));
          }
        } catch (err) {
          console.error("Error fetching data:", err);
          setError("Error al cargar los datos");
        } finally {
          setLoading(false);
        }
      };

      fetchPlayersAndScorers();
    }
  }, [open, match]);

  // Calcular total de goles
  const totalGoals = scorers.reduce(
    (sum, scorer) => sum + (parseInt(scorer.goals) || 0),
    0
  );
  const matchTotalGoals =
    (parseInt(match?.scoreTeam1) || 0) + (parseInt(match?.scoreTeam2) || 0);
  const isValid = totalGoals === matchTotalGoals;

  const handleAddScorer = (teamId) => {
    setScorers([
      ...scorers,
      {
        playerId: "",
        teamId: teamId,
        goals: 1,
      },
    ]);
  };

  const handleRemoveScorer = (index) => {
    const newScorers = [...scorers];
    newScorers.splice(index, 1);
    setScorers(newScorers);
  };

  const handleScorerChange = (index, field, value) => {
    const newScorers = [...scorers];
    if (field === "goals") {
      // Asegurar que sea un número válido
      const numValue = parseInt(value) || 0;
      newScorers[index][field] = numValue < 0 ? 0 : numValue;
    } else {
      newScorers[index][field] = value;
    }
    setScorers(newScorers);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validación adicional
      if (!isValid) {
        throw new Error(
          `El total de goles (${totalGoals}) debe coincidir con el resultado del partido (${matchTotalGoals})`
        );
      }

      // Preparar datos para enviar
      const scorersToSend = scorers.map((scorer) => ({
        playerId: scorer.playerId,
        teamId: scorer.teamId,
        goals: scorer.goals,
      }));

      await addScorersToMatch(match._id, scorersToSend);

      // Refrescar tabla de goleadores y partido si corresponde
      if (typeof refreshScorersData === 'function') {
        await refreshScorersData();
      }
      if (typeof fetchMatchDetails === 'function') {
        await fetchMatchDetails();
      }

      setSuccess("Goleadores agregados correctamente");
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Error adding scorers:", err);
      setError(err.message || "Error al agregar goleadores");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} disableRestoreFocus>
      <Box sx={style}>
        <Typography variant="h6" gutterBottom>
          Agregar Goleadores
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          {match?.team1?.name} {match?.scoreTeam1} - {match?.scoreTeam2}{" "}
          {match?.team2?.name}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" gutterBottom>
            Total de goles: <strong>{totalGoals}</strong> / {matchTotalGoals}
          </Typography>
          {!isValid && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              El total de goles debe coincidir con el resultado del partido
            </Alert>
          )}
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            {match?.team1?.name}
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleAddScorer(match.team1._id)}
            disabled={loading}
          >
            Agregar goleador
          </Button>

          <Typography variant="subtitle2" gutterBottom sx={{ mt: 3 }}>
            {match?.team2?.name}
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleAddScorer(match.team2._id)}
            disabled={loading}
          >
            Agregar goleador
          </Button>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" gutterBottom>
          Goleadores registrados
        </Typography>

        {scorers.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No se han agregado goleadores
          </Typography>
        ) : (
          <Box sx={{ mb: 3 }}>
            {scorers.map((scorer, index) => {
              const team =
                scorer.teamId === match.team1._id ? match.team1 : match.team2;
              const players =
                scorer.teamId === match.team1._id ? team1Players : team2Players;

              return (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    mb: 2,
                    p: 2,
                    backgroundColor: "#f5f5f5",
                    borderRadius: 1,
                  }}
                >
                  <Chip label={team.name} size="small" />

                  <FormControl sx={{ minWidth: 200 }} size="small">
                    <InputLabel>Jugador</InputLabel>
                    <Select
                      value={scorer.playerId}
                      label="Jugador"
                      onChange={(e) =>
                        handleScorerChange(index, "playerId", e.target.value)
                      }
                      disabled={loading}
                    >
                      {players.map((player) => (
                        <MenuItem key={player._id} value={player._id}>
                          {player.fullName ||
                            `${player.firstName} ${player.lastName}`}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                    label="Goles"
                    type="number"
                    size="small"
                    value={scorer.goals}
                    onChange={(e) =>
                      handleScorerChange(index, "goals", e.target.value)
                    }
                    inputProps={{ min: 1 }}
                    sx={{ width: 80 }}
                    disabled={loading}
                  />

                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleRemoveScorer(index)}
                    disabled={loading}
                  >
                    Eliminar
                  </Button>
                </Box>
              );
            })}
          </Box>
        )}

        <Box
          sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}
        >
          <Button onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading || !isValid || scorers.length === 0}
          >
            {loading ? <CircularProgress size={24} /> : "Guardar Goleadores"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default AddScorersModal;
