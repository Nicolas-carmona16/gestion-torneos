import { Container, Typography, Alert, Box, IconButton } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUser } from "../services/authService";
import { getAllSports } from "../services/sportService";
import { getAllTournaments } from "../services/tournamentService";
import UserForm from "../components/Users/UserForm";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const CreateUserPage = () => {
  const [sports, setSports] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        const sportsData = await getAllSports();
        const tournamentsData = await getAllTournaments();
        setSports(sportsData);
        setTournaments(tournamentsData);
      } catch (err) {
        console.error("Error cargando deportes y torneos:", err);
      }
    };
    fetch();
  }, []);

  const handleSubmit = async (
    values,
    { setSubmitting, setErrors, resetForm }
  ) => {
    try {
      await createUser(values);
      setSuccessMessage("¡Usuario creado exitosamente!");
      resetForm();
      setTimeout(() => navigate("/gestion-usuarios"), 2000);
    } catch (err) {
      console.error("Error al crear usuario:", err);
      setErrors({ form: "Error inesperado. Intenta nuevamente." });
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate("/gestion-usuarios");
  };

  return (
    <Container
      sx={{
        mt: 3,
        mb: 3,
        p: 6,
        bgcolor: "white",
        boxShadow: 5,
        borderRadius: 4,
        width: "100%",
        maxWidth: "none",
      }}
    >
      <Box display="flex" alignItems="center" mb={2}>
        <IconButton onClick={handleBack} sx={{ mr: 1 }} color="primary">
          <ArrowBackIcon />
        </IconButton>
        <Box flexGrow={1} display="flex" justifyContent="center">
          <Typography variant="h4" color="#026937" fontWeight="bold">
            Crear Usuario
          </Typography>
        </Box>
      </Box>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      <UserForm
        sports={sports}
        tournaments={tournaments}
        onSubmit={handleSubmit}
      />
    </Container>
  );
};

export default CreateUserPage;
