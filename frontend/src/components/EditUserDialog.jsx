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
} from "@mui/material";
import { validationSchemaEdit } from "../utils/validationSchema";
import { useState } from "react";

/**
 * @module EditUserDialog
 * @component
 * @description Dialog component for editing a user's personal data and role.
 *
 * @param {Object} props - Component props.
 * @param {boolean} props.open - Whether the dialog is open.
 * @param {Function} props.handleClose - Function to close the dialog.
 * @param {Object} props.updatedData - The current user data being edited.
 * @param {Function} props.setUpdatedData - Function to update the user data state.
 * @param {Function} props.handleUpdateUser - Function to handle user update submission.
 *
 * @returns {JSX.Element} A dialog with fields to edit a user's name, birthdate, and role.
 *
 * @example
 * <EditUserDialog
 *   open={isDialogOpen}
 *   handleClose={closeDialog}
 *   updatedData={userData}
 *   setUpdatedData={setUserData}
 *   handleUpdateUser={submitUpdate}
 * />
 */
const EditUserDialog = ({
  open,
  handleClose,
  updatedData,
  setUpdatedData,
  handleUpdateUser,
}) => {
  const [errors, setErrors] = useState({});

  return (
    <Dialog open={open} onClose={handleClose}>
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
        <TextField
          label="Fecha de Nacimiento"
          type="date"
          inputProps={{ max: new Date().toISOString().split("T")[0] }}
          fullWidth
          margin="dense"
          value={updatedData.birthDate}
          error={!!errors.birthDate}
          helperText={errors.birthDate}
          onChange={async (e) => {
            const inputValue = e.target.value;
            try {
              await validationSchemaEdit.validateAt("birthDate", {
                birthDate: inputValue,
              });
              setUpdatedData({ ...updatedData, birthDate: inputValue });
              setErrors({ ...errors, birthDate: "" });
            } catch (error) {
              setErrors({ ...errors, birthDate: error.message });
            }
          }}
        />
        <FormControl fullWidth margin="dense">
          <InputLabel>Rol</InputLabel>
          <Select
            value={updatedData.role}
            onChange={(e) =>
              setUpdatedData({ ...updatedData, role: e.target.value })
            }
          >
            <MenuItem value="admin">Administrador</MenuItem>
            <MenuItem value="player">Jugador</MenuItem>
            <MenuItem value="referee">Árbitro</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button onClick={handleUpdateUser} color="primary">
          Actualizar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditUserDialog;
