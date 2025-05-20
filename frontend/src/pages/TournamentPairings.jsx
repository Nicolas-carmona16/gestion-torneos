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
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getUser } from "../services/authService";

const TournamentPairings = () => {
  const { tournamentId } = useParams();
  const [tournament, setTournament] = useState(null);
  const [standings, setStandings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generatingGroups, setGeneratingGroups] = useState(false);
  const [generationError, setGenerationError] = useState(null);
  const [user, setUser] = useState(null);

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
        <GroupStageView
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
        <EliminationStageView />
      )}
    </Box>
  );
};

const GroupStageView = ({
  standings,
  teamsAdvancing,
  onGenerateGroups,
  generatingGroups,
  generationError,
  user,
}) => {
  if (Object.keys(standings).length === 0) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
        <Typography>Aún no se han generado grupos para este torneo</Typography>
        {!user?.role || user.role !== "admin" ? null : (
          <Button
            variant="contained"
            color="primary"
            onClick={onGenerateGroups}
            disabled={generatingGroups}
          >
            {generatingGroups ? (
              <>
                <CircularProgress size={24} color="inherit" />
                <Box ml={2}>Generando grupos...</Box>
              </>
            ) : (
              "Generar Grupos"
            )}
          </Button>
        )}
        {generationError && (
          <Typography color="error" mt={2}>
            {generationError}
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Tabla de Posiciones - Fase de Grupos
      </Typography>

      {Object.entries(standings).map(([groupName, teams]) => (
        <Box key={groupName} mb={4}>
          <Typography variant="h6" gutterBottom>
            Grupo {groupName}
            <Chip
              label={`Clasifican ${teamsAdvancing} equipos`}
              size="small"
              sx={{ ml: 2 }}
              color="primary"
            />
          </Typography>
          <Paper elevation={3}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Posición</TableCell>
                  <TableCell>Equipo</TableCell>
                  <TableCell align="right">PJ</TableCell>
                  <TableCell align="right">PG</TableCell>
                  <TableCell align="right">PE</TableCell>
                  <TableCell align="right">PP</TableCell>
                  <TableCell align="right">GF</TableCell>
                  <TableCell align="right">GC</TableCell>
                  <TableCell align="right">DG</TableCell>
                  <TableCell align="right">Pts</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {teams.map((team, index) => (
                  <TableRow
                    key={team.team._id || index}
                    sx={{
                      backgroundColor:
                        index < teamsAdvancing
                          ? "rgba(0, 200, 0, 0.1)"
                          : "inherit",
                      "&:hover": { backgroundColor: "action.hover" },
                    }}
                  >
                    <TableCell>
                      {index + 1}
                      {index < teamsAdvancing}
                    </TableCell>
                    <TableCell>
                      {typeof team.team === "object" ? (
                        team.team.name
                      ) : (
                        <Typography color="textSecondary">
                          Equipo no encontrado
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">{team.played}</TableCell>
                    <TableCell align="right">{team.wins}</TableCell>
                    <TableCell align="right">{team.draws}</TableCell>
                    <TableCell align="right">{team.losses}</TableCell>
                    <TableCell align="right">{team.goalsFor}</TableCell>
                    <TableCell align="right">{team.goalsAgainst}</TableCell>
                    <TableCell align="right">
                      {team.goalsFor - team.goalsAgainst}
                    </TableCell>
                    <TableCell align="right">
                      <strong>{team.points}</strong>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Box>
      ))}
    </Box>
  );
};

const EliminationStageView = () => (
  <Box>
    <Typography variant="h5" gutterBottom>
      Fase de Eliminación Directa
    </Typography>
    <Typography>
      Este torneo sigue un formato de eliminación directa. Los emparejamientos
      se generarán automáticamente.
    </Typography>
  </Box>
);

export default TournamentPairings;
