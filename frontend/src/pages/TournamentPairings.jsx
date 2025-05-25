import {
  Box,
  CircularProgress,
  Typography,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Button,
} from "@mui/material";
import { getTournamentById } from "../services/tournamentService";
import {
  getGroupStandings,
  createGroupStage,
} from "../services/groupStageService";
import {
  createEliminationBracket,
  getEliminationBracket,
} from "../services/eliminationStageService";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getUser } from "../services/authService";
import GroupStage from "../components/pairings/GroupStage";
import EliminationStage from "../components/pairings/EliminationStage";

const TournamentPairings = () => {
  const { tournamentId } = useParams();
  const [tournament, setTournament] = useState(null);
  const [standings, setStandings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generatingGroups, setGeneratingGroups] = useState(false);
  const [generationError, setGenerationError] = useState(null);
  const [user, setUser] = useState(null);
  const [generatingBracket, setGeneratingBracket] = useState(false);
  const [bracket, setBracket] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [tournamentData, userData] = await Promise.all([
          getTournamentById(tournamentId),
          getUser(),
        ]);
        setTournament(tournamentData);
        setUser(userData);

        if (tournamentData.format === "group-stage") {
          const standingsData = await getGroupStandings(tournamentId);
          setStandings(standingsData);
        } else if (tournamentData.format === "elimination") {
          const bracketData = await getEliminationBracket(tournamentId);
          setBracket(bracketData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Error al cargar los datos del torneo");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tournamentId]);

  const handleGenerateGroups = async () => {
    try {
      setGeneratingGroups(true);
      setGenerationError(null);
      await createGroupStage(tournamentId);
      const standingsData = await getGroupStandings(tournamentId);
      setStandings(standingsData);
    } catch (error) {
      console.error("Error generating groups:", error);
      setGenerationError(
        error.response?.data?.error || "Error al generar los grupos"
      );
    } finally {
      setGeneratingGroups(false);
    }
  };

  const handleGenerateBracket = async () => {
    try {
      setGeneratingBracket(true);
      setGenerationError(null);
      await createEliminationBracket(tournamentId);
      const bracketData = await getEliminationBracket(tournamentId);
      setBracket(bracketData);
    } catch (error) {
      console.error("Error generating bracket:", error);
      setGenerationError(
        error.response?.data?.error || "Error al generar el bracket"
      );
    } finally {
      setGeneratingBracket(false);
    }
  };

  if (loading) {
    return (
      <Box p={3} display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!tournament) {
    return (
      <Box p={3}>
        <Typography>Torneo no encontrado</Typography>
      </Box>
    );
  }

  return (
    <Box p={3} ml={5} mr={5}>
      <Typography
        variant="h4"
        gutterBottom
        align="center"
        color="primary"
        mb={2}
        fontWeight="bold"
      >
        {tournament.name}
      </Typography>

      {tournament.format === "group-stage" ? (
        <GroupStage
          standings={standings}
          teamsAdvancing={
            tournament.groupsStageSettings?.teamsAdvancingPerGroup || 1
          }
          onGenerateGroups={handleGenerateGroups}
          generatingGroups={generatingGroups}
          generationError={generationError}
          user={user}
        />
      ) : (
        <EliminationStage
          user={user}
          onGenerateBracket={handleGenerateBracket}
          generatingBracket={generatingBracket}
          generationError={generationError}
          bracket={bracket}
        />
      )}
    </Box>
  );
};

export default TournamentPairings;
