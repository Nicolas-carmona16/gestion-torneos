import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
} from "@mui/material";

const ConfirmDeleteTournamentDialog = ({
  open,
  handleClose,
  handleDeleteTournament,
  deleting,
}) => {
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle color="primary" sx={{ fontWeight: "bold" }}>
        Confirmar Eliminación
      </DialogTitle>
      <DialogContent>
        <Typography>
          ¿Estás seguro de que deseas eliminar este torneo? Esta acción no se
          puede deshacer.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "center" }}>
        <Button onClick={handleClose} color="secondary" disabled={deleting}>
          Cancelar
        </Button>
        <Button
          onClick={handleDeleteTournament}
          color="error"
          variant="contained"
          disabled={deleting}
        >
          {deleting ? <CircularProgress size={20} /> : "Eliminar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDeleteTournamentDialog;
