import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Avatar,
  Divider,
  Paper,
  Button,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { getUser } from "../services/authService";
import { roleMapping } from "../utils/roleUtils";
import { formatBirthDate } from "../utils/dateUtils";

/**
 * @module Profile
 * @description Displays the logged-in user's profile information. Admins can access the user management panel.
 * @returns {JSX.Element} User profile page.
 */

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loadingUsers, _setLoadingUsers] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await getUser();
      setUser(userData);
    };
    fetchUser();
  }, []);

  const handleViewUsers = () => {
    navigate("/gestion-usuarios");
  };

  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ mt: 5, textAlign: "center" }}>
        <Typography variant="h5">Cargando...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 10, mb: 5 }}>
      <Paper
        elevation={4}
        sx={{ mt: 5, p: 3, borderRadius: 3, textAlign: "center" }}
      >
        <Avatar
          sx={{
            width: 100,
            height: 100,
            bgcolor: "primary.main",
            margin: "auto",
          }}
        >
          <AccountCircleIcon sx={{ fontSize: 80 }} />
        </Avatar>
        <Typography variant="h4" sx={{ mt: 2 }}>
          Perfil de Usuario
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Card sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: "grey.100" }}>
          <CardContent>
            <Typography variant="h6">
              <strong>Nombre:</strong> {user.firstName} {user.lastName}
            </Typography>
            <Typography variant="h6">
              <strong>Fecha de nacimiento:</strong>{" "}
              {formatBirthDate(user.birthDate)}
            </Typography>
            <Typography variant="h6">
              <strong>Correo:</strong> {user.email}
            </Typography>
            <Typography variant="h6">
              <strong>Rol:</strong> {roleMapping[user.role] || "Desconocido"}
            </Typography>
          </CardContent>
        </Card>

        {user.role === "admin" && (
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            onClick={handleViewUsers}
            disabled={loadingUsers}
          >
            {loadingUsers ? "Cargando..." : "Ver Usuarios"}
          </Button>
        )}
      </Paper>
    </Container>
  );
};

export default Profile;
