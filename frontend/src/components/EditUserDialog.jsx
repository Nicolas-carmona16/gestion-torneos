import React from "react";
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

const EditUserDialog = ({
  open,
  handleClose,
  updatedData,
  setUpdatedData,
  handleUpdateUser,
}) => {
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Editar Usuario</DialogTitle>
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
          fullWidth
          margin="dense"
          value={updatedData.birthDate}
          onChange={(e) =>
            setUpdatedData({ ...updatedData, birthDate: e.target.value })
          }
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
