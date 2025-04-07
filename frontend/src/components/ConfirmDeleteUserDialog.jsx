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
 * @module ConfirmDeleteUserDialog
 * @component
 * @description A modal dialog that prompts the user to confirm the deletion of another user.
 *
 * @param {Object} props - Component props.
 * @param {boolean} props.open - Controls whether the dialog is visible.
 * @param {Function} props.handleClose - Callback function to close the dialog.
 * @param {Function} props.handleDeleteUser - Callback function to execute the user deletion.
 * @param {boolean} props.deleting - Indicates if the deletion process is currently ongoing (shows a loading spinner).
 *
 * @returns {JSX.Element} A dialog component that confirms user deletion with Cancel and Delete options.
 *
 * @example
 * <ConfirmDeleteUserDialog
 *   open={isDialogOpen}
 *   handleClose={closeDialog}
 *   handleDeleteUser={confirmDelete}
 *   deleting={isDeleting}
 * />
 */
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
