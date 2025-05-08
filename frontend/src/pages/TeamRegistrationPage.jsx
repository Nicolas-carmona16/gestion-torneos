import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, CircularProgress, Typography, Alert } from "@mui/material";
import { getTournamentById } from "../services/tournamentService";
import TeamRegistrationForm from "../components/TeamsComponents/TeamRegistrationForm";
import { getTeamsByTournament } from "../services/teamService";

const TeamRegistrationPage = () => {
  const { tournamentId } = useParams();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFull, setIsFull] = useState(false);

  useEffect(() => {
    const fetchTournamentData = async () => {
      try {
        const tournamentData = await getTournamentById(tournamentId);
        const teamsData = await getTeamsByTournament(tournamentId);
        const tournamentIsFull =
          teamsData.teams.length >= tournamentData.maxTeams;
        setIsFull(tournamentIsFull);

        const currentDate = new Date();
        const registrationOpen =
          currentDate >= new Date(tournamentData.registrationStart) &&
          currentDate <= new Date(tournamentData.registrationTeamEnd);

        if (!registrationOpen) {
          throw new Error(
            "El período de registro para este torneo está cerrado"
          );
        }

        setTournament(tournamentData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTournamentData();
  }, [tournamentId]);

  const handleSuccess = () => {
    navigate(`/torneo/${tournamentId}/equipos`, {
      state: { message: "¡Equipo registrado exitosamente!" },
    });
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Typography variant="body1">
          No se puede mostrar el formulario de registro debido a un error.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
      <TeamRegistrationForm
        tournament={tournament}
        isFull={isFull}
        onSuccess={handleSuccess}
        onCancel={() => navigate("/inscripciones")}
      />
    </Box>
  );
};

export default TeamRegistrationPage;
