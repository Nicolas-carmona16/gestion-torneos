import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
} from "@mui/material";
import { useState, useEffect } from "react";

const EditTeamNameDialog = ({ open, onClose, team, onUpdate }) => {
  const [name, setName] = useState(team?.name || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (team) {
      setName(team.name || "");
    }
  }, [team]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("El nombre del equipo es requerido");
      return;
    }

    if (name.trim() === team?.name) {
      onClose();
      return;
    }

    setLoading(true);
    setError("");

    try {
      await onUpdate(team._id, name.trim());
      onClose();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Error al actualizar el nombre del equipo"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName(team?.name || "");
    setError("");
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" color="primary">
          Editar Nombre del Equipo
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Nombre del equipo"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError("");
            }}
            error={!!error}
            helperText={error}
            disabled={loading}
            autoFocus
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !name.trim()}
        >
          {loading ? "Actualizando..." : "Actualizar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditTeamNameDialog;
