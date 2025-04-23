import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";
import { tournamentEditValidationSchema } from "../utils/validationSchema";
import { useState } from "react";
import BasketballRules from "./sportsRules/BasketballRules";
import FutsalRules from "./sportsRules/FutsalRules";
import SoccerRules from "./sportsRules/SoccerRules";
import VolleyballRules from "./sportsRules/VolleyballRules";
import { getSportRules } from "../services/sportService";

const EditTournamentDialog = ({
  open,
  handleClose,
  updatedData,
  setUpdatedData,
  handleUpdateTournament,
  sports,
}) => {
  const [errors, setErrors] = useState({});
  const [loadingRules, setLoadingRules] = useState(false);

  const rulesComponents = {
    Baloncesto: BasketballRules,
    "Fútbol Sala": FutsalRules,
    Fútbol: SoccerRules,
    Voleibol: VolleyballRules,
  };

  const getSportRulesComponent = (sportId) => {
    const sport = sports.find((s) => s._id === sportId);
    return sport ? rulesComponents[sport.name] : null;
  };

  const validateForm = async () => {
    try {
      await tournamentEditValidationSchema.validate(updatedData, {
        abortEarly: false,
      });
      setErrors({});
      return true;
    } catch (validationErrors) {
      const newErrors = {};
      validationErrors.inner.forEach((error) => {
        newErrors[error.path] = error.message;
      });
      setErrors(newErrors);
      return false;
    }
  };

  const handleChange = async (field, value) => {
    if (field === "sport" && value !== updatedData.sport) {
      await loadDefaultRules(value);
    }

    setUpdatedData((prev) => ({ ...prev, [field]: value }));

    try {
      await tournamentEditValidationSchema.validateAt(field, {
        [field]: value,
      });
      setErrors((prev) => ({ ...prev, [field]: "" }));
    } catch (error) {
      setErrors((prev) => ({ ...prev, [field]: error.message }));
    }
  };

  const loadDefaultRules = async (sportId) => {
    if (!sportId) return;

    try {
      setLoadingRules(true);
      const data = await getSportRules(sportId);

      setUpdatedData((prev) => ({
        ...prev,
        customRules: data.defaultRules || null,
      }));
    } catch (error) {
      console.error("Error fetching sport rules:", error);
      setUpdatedData((prev) => ({
        ...prev,
        customRules: null,
      }));
    } finally {
      setLoadingRules(false);
    }
  };

  const handleSubmit = async () => {
    const isValid = await validateForm();
    if (isValid) {
      handleUpdateTournament();
    }
  };

  const handleRulesChange = (newRules) => {
    setUpdatedData((prev) => ({
      ...prev,
      customRules: newRules,
    }));
  };

  const dateFields = [
    { label: "Fecha Inicio de Registro", name: "registrationStart" },
    { label: "Fecha Fin de Registro", name: "registrationEnd" },
    { label: "Fecha Inicio Torneo", name: "startDate" },
    { label: "Fecha Fin Torneo", name: "endDate" },
  ];

  const numberFields = [
    { label: "Máximo Equipos", name: "maxTeams" },
    { label: "Mínimo Jugadores por Equipo", name: "minPlayersPerTeam" },
    { label: "Máximo Jugadores por Equipo", name: "maxPlayersPerTeam" },
  ];

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle color="primary" sx={{ fontWeight: "bold" }}>
        Editar Torneo
      </DialogTitle>
      <DialogContent>
        <TextField
          label="Nombre del Torneo"
          fullWidth
          margin="dense"
          value={updatedData.name}
          error={!!errors.name}
          helperText={errors.name}
          onChange={(e) => handleChange("name", e.target.value)}
        />
        <TextField
          label="Descripción"
          fullWidth
          margin="dense"
          multiline
          rows={3}
          variant="outlined"
          value={updatedData.description}
          error={!!errors.description}
          helperText={errors.description}
          onChange={(e) => handleChange("description", e.target.value)}
        />
        <FormControl fullWidth margin="dense" error={!!errors.sport}>
          <InputLabel>Deporte</InputLabel>
          <Select
            value={updatedData.sport}
            onChange={(e) => handleChange("sport", e.target.value)}
            label="Deporte"
          >
            {sports.map((sport) => (
              <MenuItem key={sport._id} value={sport._id}>
                {sport.name}
              </MenuItem>
            ))}
          </Select>
          {errors.sport && (
            <span
              style={{
                color: "#f44336",
                fontSize: "0.75rem",
                margin: "3px 14px 0",
              }}
            >
              {errors.sport}
            </span>
          )}
        </FormControl>
        <FormControl fullWidth margin="dense" error={!!errors.format}>
          <InputLabel>Formato</InputLabel>
          <Select
            value={updatedData.format}
            onChange={(e) => handleChange("format", e.target.value)}
            label="Formato"
          >
            <MenuItem value="group-stage">Fase de grupos</MenuItem>
            <MenuItem value="elimination">Eliminación directa</MenuItem>
          </Select>
          {errors.format && (
            <span
              style={{
                color: "#f44336",
                fontSize: "0.75rem",
                margin: "3px 14px 0",
              }}
            >
              {errors.format}
            </span>
          )}
        </FormControl>
        {dateFields.map((field) => (
          <TextField
            key={field.name}
            label={field.label}
            type="date"
            fullWidth
            margin="dense"
            value={updatedData[field.name]}
            error={!!errors[field.name]}
            helperText={errors[field.name]}
            onChange={(e) => handleChange(field.name, e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        ))}
        {numberFields.map((field) => (
          <TextField
            key={field.name}
            label={field.label}
            type="number"
            fullWidth
            margin="dense"
            value={updatedData[field.name]}
            error={!!errors[field.name]}
            helperText={errors[field.name]}
            onChange={(e) => handleChange(field.name, e.target.value)}
            inputProps={{ min: 1 }}
          />
        ))}
        {updatedData.sport && (
          <Box mt={2}>
            <Typography variant="h6" gutterBottom>
              Reglas del torneo
            </Typography>
            {loadingRules ? (
              <Box display="flex" justifyContent="center" my={2}>
                <CircularProgress />
              </Box>
            ) : (
              (() => {
                const RulesComponent = getSportRulesComponent(
                  updatedData.sport
                );
                return RulesComponent && updatedData.customRules ? (
                  <RulesComponent
                    rules={updatedData.customRules}
                    editable={true}
                    onChange={handleRulesChange}
                  />
                ) : null;
              })()
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          disabled={
            Object.values(errors).some((error) => error) || loadingRules
          }
        >
          Actualizar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditTournamentDialog;
