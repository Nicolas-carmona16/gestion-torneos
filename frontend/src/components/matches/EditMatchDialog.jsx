import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
} from "@mui/material";

const EditMatchDialog = ({
  open,
  onClose,
  match,
  tournamentFormat,
  formData,
  onFormChange,
  onSubmit,
}) => {
  if (!match) return null;

  const showGoalsFields =
    tournamentFormat === "group-stage" && match.round === "group";

  return (
    <Dialog open={open} onClose={onClose} fullWidth disableRestoreFocus>
      <DialogTitle>
        {`Actualizar: ${match.team1?.name || "Por definir"} vs ${
          match.team2?.name || "Por definir"
        }`}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
          {showGoalsFields && (
            <>
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
            </>
          )}
          <TextField
            label="Fecha"
            type="date"
            name="date"
            value={formData.date}
            onChange={onFormChange}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <TextField
            label="Hora"
            type="time"
            name="time"
            value={formData.time}
            onChange={onFormChange}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <TextField
            label="Descripción"
            name="description"
            value={formData.description}
            onChange={onFormChange}
            multiline
            rows={4}
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

export default EditMatchDialog;
