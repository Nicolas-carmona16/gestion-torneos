import { Container, Typography, Alert } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTournament } from "../services/tournamentService";
import { getAllSports } from "../services/sportService";
import TournamentForm from "../components/Tournaments_Inscriptions/TournamentForm";

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
      await createTournament(values);
      setSuccessMessage("¡Torneo creado exitosamente!");
      resetForm();
      setTimeout(() => navigate("/inscripciones"), 2000);
    } catch (err) {
      console.error("Error al crear torneo:", err);
      setErrors({ form: "Error inesperado. Intenta nuevamente." });
      setSubmitting(false);
    }
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
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        color="#026937"
        fontWeight="bold"
      >
        Crear Torneo
      </Typography>

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
