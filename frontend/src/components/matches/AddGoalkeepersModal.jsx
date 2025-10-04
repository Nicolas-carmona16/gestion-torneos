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
import { addGoalkeepersToMatch } from "../../services/goalkeepersService";
import { getTeamPlayers } from "../../services/teamService";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 650,
  maxWidth: "90vw",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
  maxHeight: "90vh",
  overflowY: "auto",
};

const AddGoalkeepersModal = ({ 
  open, 
  onClose, 
  match, 
  fetchMatchDetails, 
  refreshGoalkeepersData 
}) => {
  const [team1Players, setTeam1Players] = useState([]);
  const [team2Players, setTeam2Players] = useState([]);
  const [goalkeepers, setGoalkeepers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Cargar jugadores de los equipos al abrir el modal
  useEffect(() => {
    if (open && match) {
      const fetchPlayersAndGoalkeepers = async () => {
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

          // Si hay porteros existentes, cargarlos
          if (match.goalkeepers && match.goalkeepers.length > 0) {
            setGoalkeepers(match.goalkeepers.map(gk => ({
              playerId: gk.playerId._id || gk.playerId,
              teamId: gk.teamId._id || gk.teamId,
              goalsAgainst: gk.goalsAgainst,
              minutesPlayed: gk.minutesPlayed || 90
            })));
          }
        } catch (err) {
          console.error("Error fetching data:", err);
          setError("Error al cargar los datos");
        } finally {
          setLoading(false);
        }
      };

      fetchPlayersAndGoalkeepers();
    }
  }, [open, match]);

  // Calcular total de goles recibidos
  const totalGoalsAgainst = goalkeepers.reduce(
    (sum, gk) => sum + (parseInt(gk.goalsAgainst) || 0),
    0
  );
  const matchTotalGoals =
    (parseInt(match?.scoreTeam1) || 0) + (parseInt(match?.scoreTeam2) || 0);
  const isValid = totalGoalsAgainst === matchTotalGoals;

  const handleAddGoalkeeper = (teamId) => {
    setGoalkeepers([
      ...goalkeepers,
      {
        playerId: "",
        teamId: teamId,
        goalsAgainst: 0,
        minutesPlayed: 90,
      },
    ]);
  };

  const handleRemoveGoalkeeper = (index) => {
    const newGoalkeepers = [...goalkeepers];
    newGoalkeepers.splice(index, 1);
    setGoalkeepers(newGoalkeepers);
  };

  const handleGoalkeeperChange = (index, field, value) => {
    const newGoalkeepers = [...goalkeepers];
    if (field === "goalsAgainst" || field === "minutesPlayed") {
      // Asegurar que sea un número válido
      const numValue = parseInt(value) || 0;
      newGoalkeepers[index][field] = numValue < 0 ? 0 : numValue;
    } else {
      newGoalkeepers[index][field] = value;
    }
    setGoalkeepers(newGoalkeepers);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validación adicional
      if (!isValid) {
        throw new Error(
          `El total de goles recibidos (${totalGoalsAgainst}) debe coincidir con el total de goles del partido (${matchTotalGoals})`
        );
      }

      // Preparar datos para enviar
      const goalkeepersToSend = goalkeepers.map((gk) => ({
        playerId: gk.playerId,
        teamId: gk.teamId,
        goalsAgainst: gk.goalsAgainst,
        minutesPlayed: gk.minutesPlayed,
      }));

      await addGoalkeepersToMatch(match._id, goalkeepersToSend);

      // Refrescar tabla de porteros y partido si corresponde
      if (typeof refreshGoalkeepersData === 'function') {
        await refreshGoalkeepersData();
      }
      if (typeof fetchMatchDetails === 'function') {
        await fetchMatchDetails();
      }

      setSuccess("Porteros agregados correctamente");
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Error adding goalkeepers:", err);
      setError(err.message || "Error al agregar porteros");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} disableRestoreFocus>
      <Box sx={style}>
        <Typography variant="h6" gutterBottom>
          Agregar Porteros
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
            Total de goles recibidos: <strong>{totalGoalsAgainst}</strong> / {matchTotalGoals}
          </Typography>
          {!isValid && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              El total de goles recibidos debe coincidir con el total de goles del partido
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
            onClick={() => handleAddGoalkeeper(match.team1._id)}
            disabled={loading}
          >
            Agregar portero
          </Button>

          <Typography variant="subtitle2" gutterBottom sx={{ mt: 3 }}>
            {match?.team2?.name}
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleAddGoalkeeper(match.team2._id)}
            disabled={loading}
          >
            Agregar portero
          </Button>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" gutterBottom>
          Porteros registrados
        </Typography>

        {goalkeepers.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No se han agregado porteros
          </Typography>
        ) : (
          <Box sx={{ mb: 3 }}>
            {goalkeepers.map((goalkeeper, index) => {
              const team =
                goalkeeper.teamId === match.team1._id ? match.team1 : match.team2;
              const players =
                goalkeeper.teamId === match.team1._id ? team1Players : team2Players;

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
                    flexWrap: "wrap",
                  }}
                >
                  <Chip label={team.name} size="small" />

                  <FormControl sx={{ minWidth: 200 }} size="small">
                    <InputLabel>Portero</InputLabel>
                    <Select
                      value={goalkeeper.playerId}
                      label="Portero"
                      onChange={(e) =>
                        handleGoalkeeperChange(index, "playerId", e.target.value)
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
                    label="Goles Recibidos"
                    type="number"
                    size="small"
                    value={goalkeeper.goalsAgainst}
                    onChange={(e) =>
                      handleGoalkeeperChange(index, "goalsAgainst", e.target.value)
                    }
                    inputProps={{ min: 0 }}
                    sx={{ width: 120 }}
                    disabled={loading}
                  />

                  <TextField
                    label="Minutos"
                    type="number" 
                    size="small"
                    value={goalkeeper.minutesPlayed}
                    onChange={(e) =>
                      handleGoalkeeperChange(index, "minutesPlayed", e.target.value)
                    }
                    inputProps={{ min: 1, max: 120 }}
                    sx={{ width: 100 }}
                    disabled={loading}
                  />

                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleRemoveGoalkeeper(index)}
                    disabled={loading}
                  >
                    Eliminar
                  </Button>
                </Box>
              );
            })}
          </Box>
        )}

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}>
          <Button onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading || !isValid || goalkeepers.length === 0}
          >
            {loading ? <CircularProgress size={20} /> : "Guardar Porteros"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default AddGoalkeepersModal;