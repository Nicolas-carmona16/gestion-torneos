import React, { useState, useEffect } from "react";
import { getAllUsers, deleteUser, updateUser } from "../services/authService";
import { Paper, Typography, TablePagination, Snackbar } from "@mui/material";
import FilterManageUsers from "../components/FilterManageUsers";
import UserTable from "../components/UserTable";
import EditUserDialog from "../components/EditUserDialog";

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
      birthDate: user.birthDate.split("T")[0],
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

      <FilterManageUsers
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
      />

      <UserTable
        filteredUsers={filteredUsers}
        page={page}
        handleEditUser={handleEditUser}
        handleDeleteUser={handleDeleteUser}
      />

      <TablePagination
        rowsPerPageOptions={[ITEMS_PER_PAGE]}
        component="div"
        count={filteredUsers.length}
        rowsPerPage={ITEMS_PER_PAGE}
        page={page}
        onPageChange={handleChangePage}
      />

      <EditUserDialog
        open={editModalOpen}
        handleClose={() => setEditModalOpen(false)}
        updatedData={updatedData}
        setUpdatedData={setUpdatedData}
        handleUpdateUser={handleUpdateUser}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />
    </Paper>
  );
};

export default ManageUsers;
