import React, { useState, useEffect } from "react";
import { getAllUsers, deleteUser, updateUser } from "../services/authService";
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  TablePagination,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Box,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { formatBirthDate } from "../utils/dateUtils";

const ITEMS_PER_PAGE = 5;

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [updatedData, setUpdatedData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    birthDate: "",
    role: "",
  });

  useEffect(() => {
    const fetchUsers = async () => {
      const usersData = await getAllUsers();
      setUsers(usersData);
      setFilteredUsers(usersData);
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter((user) => {
      const userFullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      const userEmail = user.email.toLowerCase();
      return (
        userFullName.includes(searchTerm.toLowerCase()) ||
        userEmail.includes(searchTerm.toLowerCase())
      );
    });

    const finalFilteredUsers = filtered.filter((user) => {
      return roleFilter ? user.role === roleFilter : true;
    });

    setFilteredUsers(finalFilteredUsers);
    setPage(0);
  }, [searchTerm, roleFilter, users]);

  const handleEditUser = (user) => {
    setCurrentUser(user);
    setUpdatedData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      birthDate: user.birthDate.split('T')[0],
      role: user.role,
    });
    setEditModalOpen(true);
  };

  const handleUpdateUser = async () => {
    try {
      await updateUser(currentUser._id, updatedData);
      setSnackbarMessage("Usuario actualizado correctamente");
      setSnackbarOpen(true);

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === currentUser._id ? { ...user, ...updatedData } : user
        )
      );
      setFilteredUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === currentUser._id ? { ...user, ...updatedData } : user
        )
      );

      setEditModalOpen(false);
    } catch {
      setSnackbarMessage("Error al actualizar usuario");
      setSnackbarOpen(true);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await deleteUser(userId);
      setSnackbarMessage("Usuario eliminado correctamente");
      setSnackbarOpen(true);

      setUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
      setFilteredUsers((prevUsers) =>
        prevUsers.filter((user) => user._id !== userId)
      );
    } catch {
      setSnackbarMessage("Hubo un error al eliminar el usuario");
      setSnackbarOpen(true);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Paper
      sx={{
        p: 3,
        mt: 5,
        mb: 5,
        mx: "auto",
        maxWidth: "80%",
        textAlign: "center",
      }}
    >
      <Typography variant="h4" color="primary" fontWeight="bold" mb={3}>
        Gestión de Usuarios
      </Typography>

      {/* Filtros */}
      <Box mb={3} display="flex" justifyContent="center" gap={2}>
        <TextField
          label="Buscar por nombre o correo"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <FormControl fullWidth>
          <InputLabel>Filtrar por rol</InputLabel>
          <Select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            label="Filtrar por rol"
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="admin">Administrador</MenuItem>
            <MenuItem value="player">Jugador</MenuItem>
            <MenuItem value="referee">Árbitro</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer>
        <Table>
          <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
            <TableRow sx={{ fontWeight: "bold" }}>
              <TableCell sx={{ fontWeight: "bold" }}>Nombre</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Correo</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>
                Fecha de Nacimiento
              </TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Rol</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers
              .slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE)
              .map((user) => (
                <TableRow key={user._id}>
                  <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{formatBirthDate(user.birthDate)}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell sx={{ textAlign: "left", width: "15%" }}>
                    <IconButton
                      color="primary"
                      onClick={() => handleEditUser(user)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="secondary"
                      onClick={() => handleDeleteUser(user._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[ITEMS_PER_PAGE]}
        component="div"
        count={filteredUsers.length}
        rowsPerPage={ITEMS_PER_PAGE}
        page={page}
        onPageChange={handleChangePage}
      />

      {/* Modal de edición */}
      <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)}>
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
          <Button onClick={() => setEditModalOpen(false)}>Cancelar</Button>
          <Button onClick={handleUpdateUser} color="primary">
            Actualizar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />
    </Paper>
  );
};

export default ManageUsers;
