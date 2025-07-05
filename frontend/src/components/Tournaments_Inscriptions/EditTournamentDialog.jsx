import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  FormControlLabel,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  Typography,
  CircularProgress,
  Switch,
  Collapse,
} from "@mui/material";
import { tournamentEditValidationSchema } from "../../utils/validationSchema";
import { useState, useEffect } from "react";
import BasketballRules from "../sportsRules/BasketballRules";
import FutsalRules from "../sportsRules/FutsalRules";
import SoccerRules from "../sportsRules/SoccerRules";
import VolleyballRules from "../sportsRules/VolleyballRules";
import { getSportRules } from "../../services/sportService";

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
  const [showGroupSettings, setShowGroupSettings] = useState(
    updatedData.format === "group-stage"
  );

  const rulesComponents = {
    Baloncesto: BasketballRules,
    "Fútbol Sala": FutsalRules,
    Fútbol: SoccerRules,
    Voleibol: VolleyballRules,
  };

  useEffect(() => {
    setShowGroupSettings(updatedData.format === "group-stage");
  }, [updatedData.format]);

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
    } catch (error) {
      if (error.name === "ValidationError") {
        const newErrors = {};
        error.inner?.forEach((err) => {
          newErrors[err.path] = err.message;
        });
        setErrors(newErrors);
      } else {
        console.error("Validation error:", error);
      }
      return false;
    }
  };

  const handleChange = async (field, value) => {
    if (field === "sport" && value !== updatedData.sport) {
      await loadDefaultRules(value);
    }

    if (field === "format") {
      setShowGroupSettings(value === "group-stage");
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

  const handleGroupSettingsChange = (field, value) => {
    setUpdatedData((prev) => ({
      ...prev,
      groupsStageSettings: {
        ...prev.groupsStageSettings,
        [field]: value,
      },
    }));
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
    { label: "Inicio Registro", name: "registrationStart" },
    { label: "Fin Registro Equipos", name: "registrationTeamEnd" },
    { label: "Fin Registro Jugadores", name: "registrationPlayerEnd" },
    { label: "Inicio Torneo", name: "startDate" },
    { label: "Fin Torneo", name: "endDate" },
  ];

  const numberFields = [
    { label: "Máximo Equipos", name: "maxTeams" },
    { label: "Mínimo Jugadores por Equipo", name: "minPlayersPerTeam" },
    { label: "Máximo Jugadores por Equipo", name: "maxPlayersPerTeam" },
    { label: "Mejor de (partidos)", name: "bestOfMatches", min: 1 },
  ];

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      disableRestoreFocus
    >
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
        <FormControlLabel
          control={
            <Switch
              checked={updatedData.isOlympiad}
              onChange={(e) => handleChange("isOlympiad", e.target.checked)}
            />
          }
          label="Es Olimpiada"
        />
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

        <Collapse in={showGroupSettings}>
          <Box mt={2} p={2} borderRadius={1}>
            <Typography variant="subtitle2" gutterBottom>
              Configuración de Fase de Grupos
            </Typography>

            <TextField
              label="Equipos por grupo"
              type="number"
              fullWidth
              margin="dense"
              value={updatedData.groupsStageSettings?.teamsPerGroup || ""}
              error={!!errors.groupsStageSettings?.teamsPerGroup}
              helperText={errors.groupsStageSettings?.teamsPerGroup}
              onChange={(e) =>
                handleGroupSettingsChange("teamsPerGroup", e.target.value)
              }
              inputProps={{ min: 2 }}
            />

            <TextField
              label="Equipos que avanzan"
              type="number"
              fullWidth
              margin="dense"
              value={
                updatedData.groupsStageSettings?.teamsAdvancingPerGroup || ""
              }
              error={!!errors.groupsStageSettings?.teamsAdvancingPerGroup}
              helperText={errors.groupsStageSettings?.teamsAdvancingPerGroup}
              onChange={(e) =>
                handleGroupSettingsChange(
                  "teamsAdvancingPerGroup",
                  e.target.value
                )
              }
              inputProps={{ min: 1 }}
            />

            <FormControl fullWidth margin="dense">
              <InputLabel>Tipo de enfrentamientos</InputLabel>
              <Select
                value={
                  updatedData.groupsStageSettings?.matchesPerTeamInGroup || "single"
                }
                onChange={(e) =>
                  handleGroupSettingsChange(
                    "matchesPerTeamInGroup",
                    e.target.value
                  )
                }
                label="Tipo de enfrentamientos"
              >
                <MenuItem value="single">Solo ida</MenuItem>
                <MenuItem value="double">Ida y vuelta</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Collapse>

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
