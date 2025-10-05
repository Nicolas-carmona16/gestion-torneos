import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, CircularProgress, Typography, Alert } from "@mui/material";
import { getTournamentById } from "../services/tournamentService";
import TeamRegistrationForm from "../components/TeamsComponents/TeamRegistrationForm";
import { getTeamsByTournament } from "../services/teamService";
import { getUser } from "../services/authService";
import { isTeamRegistrationOpen } from "../utils/dateHelpers";

const TeamRegistrationPage = () => {
  const { tournamentId } = useParams();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState(null);
  const [existingTeams, setExistingTeams] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFull, setIsFull] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [tournamentData, teamsData, userData] = await Promise.all([
          getTournamentById(tournamentId),
          getTeamsByTournament(tournamentId),
          getUser(),
        ]);

        setTournament(tournamentData);
        setExistingTeams(teamsData.teams);
        setCurrentUser(userData);

        setIsFull(teamsData.teams.length >= tournamentData.maxTeams);

        if (!isTeamRegistrationOpen(tournamentData)) {
          throw new Error(
            "El período de registro para este torneo está cerrado"
          );
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
        existingTeams={existingTeams}
        currentUser={currentUser}
        isFull={isFull}
        onSuccess={handleSuccess}
        onCancel={() => navigate("/inscripciones")}
      />
    </Box>
  );
};

export default TeamRegistrationPage;
