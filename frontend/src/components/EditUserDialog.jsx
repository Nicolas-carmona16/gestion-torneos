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
  Autocomplete,
  Chip,
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useState, useEffect } from "react";
import { getAllSports } from "../services/sportService";
import { getAllTournaments } from "../services/tournamentService";

/**
 * @module EditUserDialog
 * @component
 * @description Dialog component for editing a user's personal data, role, sports and tournaments.
 *
 * @param {Object} props - Component props.
 * @param {boolean} props.open - Whether the dialog is open.
 * @param {Function} props.handleClose - Function to close the dialog.
 * @param {Object} props.updatedData - The current user data being edited.
 * @param {Function} props.setUpdatedData - Function to update the user data state.
 * @param {Function} props.handleUpdateUser - Function to handle user update submission.
 * @param {Object} props.currentUser - The original user data before editing.
 *
 * @returns {JSX.Element} A dialog with fields to edit a user's details.
 */
const EditUserDialog = ({
  open,
  handleClose,
  updatedData,
  setUpdatedData,
  handleUpdateUser,
}) => {
  const [sportsOptions, setSportsOptions] = useState([]);
  const [tournamentsOptions, setTournamentsOptions] = useState([]);
  const [loadingSports, setLoadingSports] = useState(true);
  const [loadingTournaments, setLoadingTournaments] = useState(true);

  useEffect(() => {
    const fetchSportsAndTournaments = async () => {
      try {
        const [sports, tournaments] = await Promise.all([
          getAllSports(),
          getAllTournaments(),
        ]);

        setSportsOptions(sports);
        setTournamentsOptions(tournaments);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoadingSports(false);
        setLoadingTournaments(false);
      }
    };

    if (open) {
      fetchSportsAndTournaments();
    }
  }, [open]);

  const handleSportsChange = (_, newValue) => {
    const newSportsIds = newValue.map((sport) => sport._id);
    setUpdatedData({
      ...updatedData,
      sports: newSportsIds,
      tournaments: updatedData.tournaments.filter((tournamentId) => {
        const tournament = tournamentsOptions.find(
          (t) => t._id === tournamentId
        );
        return newSportsIds.includes(tournament?.sport?._id);
      }),
    });
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle color="primary" sx={{ fontWeight: "bold" }}>
        Editar Usuario
      </DialogTitle>
      <DialogContent>
        <TextField
          label="Nombre"
          fullWidth
          margin="dense"
          value={updatedData.firstName}
          onChange={(e) =>
            setUpdatedData({ ...updatedData, firstName: e.target.value })
          }
          sx={{ mt: 2 }}
        />
        <TextField
          label="Apellido"
          fullWidth
          margin="dense"
          value={updatedData.lastName}
          onChange={(e) =>
            setUpdatedData({ ...updatedData, lastName: e.target.value })
          }
        />
        <TextField
          label="Correo"
          fullWidth
          margin="dense"
          value={updatedData.email}
          disabled
        />

        <FormControl fullWidth margin="dense">
          <InputLabel>Rol</InputLabel>
          <Select
            value={updatedData.role}
            onChange={(e) =>
              setUpdatedData({ ...updatedData, role: e.target.value })
            }
            label="Rol"
          >
            <MenuItem value="admin">Administrador</MenuItem>
            <MenuItem value="captain">Capitan</MenuItem>
            <MenuItem value="assistant">Auxiliar</MenuItem>
          </Select>
        </FormControl>

        <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
          Deportes
        </Typography>
        {loadingSports ? (
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <Autocomplete
            multiple
            options={sportsOptions}
            getOptionLabel={(option) => option.name}
            value={sportsOptions.filter((sport) =>
              updatedData.sports.includes(sport._id)
            )}
            onChange={handleSportsChange}
            renderInput={(params) => (
              <TextField {...params} placeholder="Selecciona deportes" />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  {...getTagProps({ index })}
                  key={`sport-${option._id}-${index}`}
                  label={option.name}
                />
              ))
            }
          />
        )}

        <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
          Torneos
        </Typography>
        {loadingTournaments ? (
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <Autocomplete
            multiple
            options={tournamentsOptions.filter((tournament) =>
              updatedData.sports.includes(tournament.sport?._id)
            )}
            getOptionLabel={(option) => option.name}
            value={tournamentsOptions.filter((tournament) =>
              updatedData.tournaments.includes(tournament._id)
            )}
            onChange={(_, newValue) => {
              setUpdatedData({
                ...updatedData,
                tournaments: newValue.map((tournament) => tournament._id),
              });
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Selecciona torneos"
                disabled={updatedData.sports.length === 0}
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  {...getTagProps({ index })}
                  key={`tournament-${option._id}-${index}`}
                  label={option.name}
                />
              ))
            }
            disabled={updatedData.sports.length === 0}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button onClick={handleUpdateUser} color="primary" variant="contained">
          Actualizar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditUserDialog;
