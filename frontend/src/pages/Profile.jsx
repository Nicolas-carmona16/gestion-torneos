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
  Box,
  CircularProgress,
  Chip,
  Stack,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { getUser } from "../services/authService";
import { roleMapping } from "../utils/roleUtils";

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
      try {
        const userData = await getUser();
        setUser({
          ...userData,
          sports: userData?.sports || [],
          tournaments: userData?.tournaments || [],
        });
      } catch (error) {
        console.error("Error loading profile:", error);
      }
    };
    fetchUser();
  }, []);

  const handleViewUsers = () => {
    navigate("/gestion-usuarios");
  };

  if (!user) {
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
              <strong>Correo:</strong> {user.email}
            </Typography>
            <Typography variant="h6">
              <strong>Rol:</strong> {roleMapping[user.role] || "Desconocido"}
            </Typography>
            <Divider textAlign="left" sx={{ my: 2 }}>
              <Chip
                icon={<SportsSoccerIcon />}
                label="Deportes"
                color="primary"
              />
            </Divider>
            {user.sports.length > 0 ? (
              <Stack
                direction="row"
                spacing={1}
                sx={{ flexWrap: "wrap", gap: 1, justifyContent: "center" }}
              >
                {user.sports.map((sport) => (
                  <Chip
                    key={sport._id}
                    label={sport.name}
                    color="secondary"
                    variant="outlined"
                  />
                ))}
              </Stack>
            ) : (
              <Typography variant="body1" color="text.secondary" align="center">
                No hay deportes asignados
              </Typography>
            )}
            <Divider textAlign="left" sx={{ my: 2 }}>
              <Chip
                icon={<EmojiEventsIcon />}
                label="Torneos"
                color="primary"
              />
            </Divider>
            {user.tournaments.length > 0 ? (
              <Stack
                direction="row"
                spacing={1}
                sx={{ flexWrap: "wrap", gap: 1, justifyContent: "center" }}
              >
                {user.tournaments.map((tournament) => (
                  <Chip
                    key={tournament._id}
                    label={tournament.name}
                    color="secondary"
                    variant="outlined"
                  />
                ))}
              </Stack>
            ) : (
              <Typography variant="body1" color="text.secondary" align="center">
                No hay torneos asignados
              </Typography>
            )}
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
