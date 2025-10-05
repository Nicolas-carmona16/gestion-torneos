import { Container, Typography, Alert, Box, IconButton } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTournament } from "../services/tournamentService";
import { getAllSports } from "../services/sportService";
import TournamentForm from "../components/Tournaments_Inscriptions/TournamentForm";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { prepareDatesForBackend } from "../utils/dateHelpers";

const CreateTournamentPage = () => {
  const [sports, setSports] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSports = async () => {
      try {
        const data = await getAllSports();
        setSports(data);
      } catch (err) {
        console.error("Error cargando deportes:", err);
      }
    };
    fetchSports();
  }, []);

  const handleSubmit = async (
    values,
    { setSubmitting, setErrors, resetForm }
  ) => {
    try {
      // Preparar fechas correctamente antes de enviar al backend
      const dataToSend = prepareDatesForBackend(values);
      
      await createTournament(dataToSend);
      setSuccessMessage("¡Torneo creado exitosamente!");
      resetForm();
      setTimeout(() => navigate("/inscripciones"), 2000);
    } catch (err) {
      console.error("Error al crear torneo:", err);
      setErrors({ form: "Error inesperado. Intenta nuevamente." });
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate("/inscripciones");
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
            Crear Torneo
          </Typography>
        </Box>
      </Box>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      <TournamentForm sports={sports} onSubmit={handleSubmit} />
    </Container>
  );
};

export default CreateTournamentPage;
