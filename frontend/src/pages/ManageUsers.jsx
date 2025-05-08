import { useState, useEffect } from "react";
import {
  getAllUsers,
  deleteUser,
  updateUser,
  getUser,
} from "../services/authService";
import {
  Paper,
  Typography,
  TablePagination,
  Snackbar,
  CircularProgress,
  Box,
  Alert,
  Button,
} from "@mui/material";
import FilterManageUsers from "../components/Users/FilterManageUsers";
import UserTable from "../components/Users/UserTable";
import EditUserDialog from "../components/Users/EditUserDialog";
import ConfirmDeleteDialog from "../components/ConfirmDeleteDialog";
import { useNavigate } from "react-router-dom";

const ITEMS_PER_PAGE = 5;

/**
 * @module ManageUsers
 * @description Admin panel to manage users: list, filter, edit, and delete users.
 * @returns {JSX.Element} User management interface.
 */
const ManageUsers = () => {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [loading, setLoading] = useState(true);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [updatedData, setUpdatedData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
    sports: [],
    tournaments: [],
  });

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const [usersData, currentUser] = await Promise.all([
          getAllUsers(),
          getUser(),
        ]);
        setUsers(usersData);
        setFilteredUsers(usersData);
        setUser(currentUser);
      } catch (error) {
        console.error("Error al obtener usuarios", error);
        setSnackbarMessage("Error al cargar usuarios");
        setSnackbarOpen(true);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter((user) => {
      if (!user) return false;
      const firstName = user.firstName || "";
      const lastName = user.lastName || "";
      const email = user.email || "";

      const userFullName = `${firstName} ${lastName}`.toLowerCase();
      const userEmail = email.toLowerCase();
      const searchTermLower = searchTerm.toLowerCase();
      return (
        userFullName.includes(searchTermLower) ||
        userEmail.includes(searchTermLower)
      );
    });

    const finalFilteredUsers = roleFilter
      ? filtered.filter((user) => user?.role === roleFilter)
      : filtered;

    setFilteredUsers(finalFilteredUsers);
    setPage(0);
  }, [searchTerm, roleFilter, users]);

  const handleEditUser = (user) => {
    setCurrentUser(user);
    setUpdatedData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      sports: user.sports.map((sport) => sport._id),
      tournaments: user.tournaments.map((tournament) => tournament._id),
    });
    setEditModalOpen(true);
  };

  const handleUpdateUser = async () => {
    try {
      const response = await updateUser(currentUser._id, updatedData);
      setSnackbarMessage("Usuario actualizado correctamente");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);

      const updatedUserWithPopulatedData = response.user;

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === currentUser._id ? updatedUserWithPopulatedData : user
        )
      );
      setFilteredUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === currentUser._id ? updatedUserWithPopulatedData : user
        )
      );

      setEditModalOpen(false);
    } catch (error) {
      console.error("Error updating user:", error);
      setSnackbarMessage(
        error.response?.data?.message ||
          "Error al actualizar el usuario. Por favor intente nuevamente."
      );
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const confirmDeleteUser = (userId) => {
    setUserToDelete(userId);
    setDeleteModalOpen(true);
  };

  const handleDeleteUser = async () => {
    setDeleting(true);
    try {
      await deleteUser(userToDelete);
      setSnackbarMessage("Usuario eliminado correctamente");
      setSnackbarOpen(true);

      setUsers((prevUsers) =>
        prevUsers.filter((user) => user._id !== userToDelete)
      );
      setFilteredUsers((prevUsers) =>
        prevUsers.filter((user) => user._id !== userToDelete)
      );
    } catch (error) {
      console.error("Error deleting user:", error);
      setSnackbarMessage("Hubo un error al eliminar el usuario");
      setSnackbarOpen(true);
    }
    setDeleting(false);
    setDeleteModalOpen(false);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

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
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Box
          display="flex"
          justifyContent="center"
          flexGrow={1}
          marginLeft={20}
        >
          <Typography variant="h4" color="primary" fontWeight="bold">
            Gestión de Usuarios
          </Typography>
        </Box>

        {user?.role === "admin" && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/crear-usuario")}
          >
            Crear Usuario
          </Button>
        )}
      </Box>

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
        handleDeleteUser={confirmDeleteUser}
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
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        message={snackbarMessage}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <ConfirmDeleteDialog
        open={deleteModalOpen}
        handleClose={() => setDeleteModalOpen(false)}
        handleConfirm={handleDeleteUser}
        deleting={deleting}
        entityName="usuario"
      />
    </Paper>
  );
};

export default ManageUsers;
