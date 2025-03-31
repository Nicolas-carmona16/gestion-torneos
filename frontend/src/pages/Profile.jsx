import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Avatar,
  Divider,
  Paper,
} from "@mui/material";
import { getUser } from "../services/authService";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { roleMapping } from "../utils/roleUtils";
import { formatBirthDate } from "../utils/dateUtils";

const Profile = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await getUser();
      setUser(userData);
    };

    fetchUser();
  }, []);

  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ mt: 5, textAlign: "center" }}>
        <Typography variant="h5">Cargando...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 10 }}>
      <Paper
        elevation={4}
        sx={{
          mt: 5,
          p: 3,
          borderRadius: 3,
          textAlign: "center",
        }}
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
        <Card
          sx={{
            mt: 2,
            p: 2,
            borderRadius: 2,
            bgcolor: "grey.100",
          }}
        >
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
      </Paper>
    </Container>
  );
};

export default Profile;
