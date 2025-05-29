import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
} from "@mui/material";

const SeriesGameDialog = ({
  open,
  onClose,
  match,
  formData,
  onFormChange,
  onSubmit,
}) => {
  if (!match) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>{"Agregar Nuevo Juego"}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
          <TextField
            label={`Goles ${match.team1?.name || "Equipo 1"}`}
            type="number"
            name="scoreTeam1"
            value={formData.scoreTeam1}
            onChange={onFormChange}
            fullWidth
          />
          <TextField
            label={`Goles ${match.team2?.name || "Equipo 2"}`}
            type="number"
            name="scoreTeam2"
            value={formData.scoreTeam2}
            onChange={onFormChange}
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="error">
          Cancelar
        </Button>
        <Button onClick={onSubmit} color="primary" variant="contained">
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SeriesGameDialog;
