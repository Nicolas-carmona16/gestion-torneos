import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
} from "@mui/material";

/**
 * @module ConfirmDeleteDialog
 * @component
 * @description Reusable confirmation dialog for deletions.
 *
 * @param {Object} props - Component props.
 * @param {boolean} props.open - Whether the dialog is open.
 * @param {Function} props.handleClose - Function to close the dialog.
 * @param {Function} props.handleConfirm - Function to execute on confirmation.
 * @param {boolean} props.deleting - Whether the delete action is loading.
 * @param {string} props.entityName - Name of the entity being deleted (e.g., 'usuario', 'torneo').
 * @param {string} [props.warning] - Optional additional warning text.
 * @param {string} [props.confirmButtonColor] - Button color, defaults to 'primary'.
 *
 * @returns {JSX.Element}
 */
const ConfirmDeleteDialog = ({
  open,
  handleClose,
  handleConfirm,
  deleting,
  entityName,
  warning = "",
  confirmButtonColor = "primary",
}) => {
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle color="primary" sx={{ fontWeight: "bold" }}>
        Confirmar Eliminación
      </DialogTitle>
      <DialogContent>
        <Typography>
          ¿Estás seguro de que deseas eliminar este {entityName}?
        </Typography>
        {warning && (
          <Typography variant="body2" color="error" mt={1}>
            {warning}
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ justifyContent: "center" }}>
        <Button onClick={handleClose} color="secondary" disabled={deleting}>
          Cancelar
        </Button>
        <Button
          onClick={handleConfirm}
          color={confirmButtonColor}
          variant="contained"
          disabled={deleting}
        >
          {deleting ? <CircularProgress size={24} /> : "Eliminar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDeleteDialog;
