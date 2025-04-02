import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
} from "@mui/material";

const ConfirmDeleteUserDialog = ({
  open,
  handleClose,
  handleDeleteUser,
  deleting,
}) => {
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle color="primary" sx={{ fontWeight: "bold" }}>
        Confirmar Eliminación
      </DialogTitle>
      <DialogContent>
        <Typography>
          ¿Estás seguro de que deseas eliminar este usuario?
        </Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "center" }}>
        <Button onClick={handleClose} color="secondary" disabled={deleting}>
          Cancelar
        </Button>
        <Button
          onClick={handleDeleteUser}
          color="primary"
          variant="contained"
          disabled={deleting}
        >
          {deleting ? <CircularProgress size={24} /> : "Eliminar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDeleteUserDialog;
