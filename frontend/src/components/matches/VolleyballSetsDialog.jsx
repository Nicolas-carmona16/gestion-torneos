import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  Alert,
  Divider,
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";

const VolleyballSetsDialog = ({
  open,
  onClose,
  match,
  formData,
  onFormChange,
  onSubmit,
}) => {
  const [sets, setSets] = useState([]);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    if (open && match) {
      // Inicializar sets si ya existen
      if (match.setScores && match.setScores.length > 0) {
        setSets(match.setScores);
      } else {
        // Crear un set inicial
        setSets([
          {
            setNumber: 1,
            scoreTeam1: 0,
            scoreTeam2: 0,
          },
        ]);
      }
    }
  }, [open, match]);

  const addSet = () => {
    const { setsToWin } = getTournamentRules();
    const maxPossibleSets = (setsToWin * 2) - 1; // Ej: si se necesitan 3 sets para ganar, max = 5 sets
    
    if (sets.length < maxPossibleSets) {
      const newSet = {
        setNumber: sets.length + 1,
        scoreTeam1: 0,
        scoreTeam2: 0,
      };
      setSets([...sets, newSet]);
    }
  };

  const removeSet = (index) => {
    if (sets.length > 1) {
      const newSets = sets.filter((_, i) => i !== index);
      // Renumerar los sets
      const renumberedSets = newSets.map((set, i) => ({
        ...set,
        setNumber: i + 1,
      }));
      setSets(renumberedSets);
    }
  };

  const updateSet = (index, field, value) => {
    const newSets = [...sets];
    newSets[index] = {
      ...newSets[index],
      [field]: parseInt(value) || 0,
    };
    setSets(newSets);
  };

  // Helper function to extract tournament rules
  const getTournamentRules = () => {
    const tournamentRules = match?.tournament?.customRules || {};
    
    return {
      regularSetPoints: 
        tournamentRules.sets?.regularSetPoints || 
        tournamentRules.regularSetPoints || 
        25,
      lastSetPoints: 
        tournamentRules.sets?.lastSetPoints || 
        tournamentRules.lastSetPoints || 
        15,
      minDifference: 
        tournamentRules.sets?.minDifference || 
        tournamentRules.minDifference || 
        2,
      setsToWin: 
        tournamentRules.setsToWin || 
        3
    };
  };

  const validateSets = () => {
    const newErrors = [];
    const { regularSetPoints, lastSetPoints, minDifference, setsToWin } = getTournamentRules();

    sets.forEach((set, index) => {
      const { setNumber, scoreTeam1, scoreTeam2 } = set;
      
      // Calcular sets ganados antes de este set
      const team1SetsBefore = sets.slice(0, index).filter(s => s.scoreTeam1 > s.scoreTeam2).length;
      const team2SetsBefore = sets.slice(0, index).filter(s => s.scoreTeam2 > s.scoreTeam1).length;
      
      // Es el último set si cualquier equipo puede ganar el partido con este set
      const couldBeDecisive = (team1SetsBefore === setsToWin - 1) || (team2SetsBefore === setsToWin - 1);
      const isLastSet = couldBeDecisive;
      
      const requiredPoints = isLastSet ? lastSetPoints : regularSetPoints;

      // Validar que los puntajes no sean negativos
      if (scoreTeam1 < 0 || scoreTeam2 < 0) {
        newErrors.push(
          `Set ${setNumber}: Los puntajes no pueden ser negativos`
        );
      }

      // Validar que al menos un equipo tenga los puntos requeridos
      if (scoreTeam1 < requiredPoints && scoreTeam2 < requiredPoints) {
        newErrors.push(
          `Set ${setNumber}: Al menos un equipo debe tener ${requiredPoints} puntos`
        );
      }

      // Validar diferencia mínima
      const difference = Math.abs(scoreTeam1 - scoreTeam2);
      if (difference > 0 && difference < minDifference) {
        newErrors.push(
          `Set ${setNumber}: La diferencia debe ser de al menos ${minDifference} puntos`
        );
      }

      // Validar que no haya empate
      if (scoreTeam1 === scoreTeam2 && scoreTeam1 > 0) {
        newErrors.push(`Set ${setNumber}: No puede haber empate en voleibol`);
      }
    });

    // Validar que el partido esté completo
    const team1Sets = sets.filter(
      (set) => set.scoreTeam1 > set.scoreTeam2
    ).length;
    const team2Sets = sets.filter(
      (set) => set.scoreTeam2 > set.scoreTeam1
    ).length;

    if (team1Sets < setsToWin && team2Sets < setsToWin) {
      newErrors.push(`El partido debe completarse a ${setsToWin} sets`);
    }

    // Validar que no se jueguen sets innecesarios
    if (team1Sets >= setsToWin && team2Sets >= setsToWin) {
      newErrors.push("No se pueden ganar sets ambos equipos");
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = () => {
    if (validateSets()) {
      // Calcular resultado del partido
      const team1Sets = sets.filter(
        (set) => set.scoreTeam1 > set.scoreTeam2
      ).length;
      const team2Sets = sets.filter(
        (set) => set.scoreTeam2 > set.scoreTeam1
      ).length;

      const setScores = sets.map((set) => ({
        setNumber: set.setNumber,
        scoreTeam1: set.scoreTeam1,
        scoreTeam2: set.scoreTeam2,
        winner:
          set.scoreTeam1 > set.scoreTeam2
            ? match.team1._id
            : set.scoreTeam2 > set.scoreTeam1
            ? match.team2._id
            : null,
      }));

      const updateData = {
        setScores,
        setsTeam1: team1Sets,
        setsTeam2: team2Sets,
        date: formData.date,
        time: formData.time,
        description: formData.description,
      };

      onSubmit(updateData);
    }
  };

  const team1Sets = sets.filter(
    (set) => set.scoreTeam1 > set.scoreTeam2
  ).length;
  const team2Sets = sets.filter(
    (set) => set.scoreTeam2 > set.scoreTeam1
  ).length;

  // Get tournament rules for UI display
  const { setsToWin, regularSetPoints, lastSetPoints } = getTournamentRules();
  const maxPossibleSets = (setsToWin * 2) - 1;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" disableRestoreFocus>
      <DialogTitle>
        {`Actualizar Sets: ${match?.team1?.name || "Equipo 1"} vs ${
          match?.team2?.name || "Equipo 2"
        }`}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
          {errors.length > 0 && (
            <Alert severity="error">
              <Typography variant="subtitle2" gutterBottom>
                Errores de validación:
              </Typography>
              {errors.map((error, index) => (
                <Typography key={index} variant="body2">
                  • {error}
                </Typography>
              ))}
            </Alert>
          )}

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography variant="h6">
                Resultado: {team1Sets} - {team2Sets}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Se necesitan {setsToWin} sets para ganar • Sets regulares: {regularSetPoints} pts • Último set: {lastSetPoints} pts
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={addSet}
              disabled={sets.length >= maxPossibleSets}
            >
              Agregar Set
            </Button>
          </Box>

          <Divider />

          {sets.map((set, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                p: 2,
                border: "1px solid #e0e0e0",
                borderRadius: 1,
                backgroundColor: "#f9f9f9",
              }}
            >
              <Typography variant="subtitle1" sx={{ minWidth: "60px" }}>
                Set {set.setNumber}:
              </Typography>

              <TextField
                label={match?.team1?.name || "Equipo 1"}
                type="number"
                value={set.scoreTeam1}
                onChange={(e) => updateSet(index, "scoreTeam1", e.target.value)}
                size="small"
                sx={{ width: "100px" }}
              />

              <Typography variant="h6">-</Typography>

              <TextField
                label={match?.team2?.name || "Equipo 2"}
                type="number"
                value={set.scoreTeam2}
                onChange={(e) => updateSet(index, "scoreTeam2", e.target.value)}
                size="small"
                sx={{ width: "100px" }}
              />

              {sets.length > 1 && (
                <IconButton
                  color="error"
                  onClick={() => removeSet(index)}
                  size="small"
                >
                  <Delete />
                </IconButton>
              )}
            </Box>
          ))}

          <TextField
            label="Fecha"
            type="date"
            name="date"
            value={formData.date}
            onChange={(e) =>
              onFormChange({ target: { name: "date", value: e.target.value } })
            }
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <TextField
            label="Hora"
            type="time"
            name="time"
            value={formData.time}
            onChange={(e) =>
              onFormChange({ target: { name: "time", value: e.target.value } })
            }
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <TextField
            label="Descripción"
            name="description"
            value={formData.description}
            onChange={(e) =>
              onFormChange({
                target: { name: "description", value: e.target.value },
              })
            }
            multiline
            rows={3}
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="error">
          Cancelar
        </Button>
        <Button onClick={handleSubmit} color="primary" variant="contained">
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VolleyballSetsDialog;
