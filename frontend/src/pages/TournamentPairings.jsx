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
        <EliminationStageView
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

const EliminationStageView = ({
  user,
  onGenerateBracket,
  generatingBracket,
  generationError,
  bracket,
}) => {
  if (!bracket || Object.keys(bracket).length === 0) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
        <Typography>
          Aún no se han generado los emparejamientos para este torneo
        </Typography>
        {!user?.role || user.role !== "admin" ? null : (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap={2}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={onGenerateBracket}
              disabled={generatingBracket}
            >
              {generatingBracket ? (
                <>
                  <CircularProgress size={24} color="inherit" />
                  <Box ml={2}>Generando bracket...</Box>
                </>
              ) : (
                "Generar Bracket"
              )}
            </Button>
            {generationError && (
              <Typography color="error" mt={2}>
                {generationError}
              </Typography>
            )}
          </Box>
        )}
      </Box>
    );
  }

  const getWinnerStyle = (match, teamId) => {
    if (!match.seriesWinner) return {};
    return match.seriesWinner._id === teamId
      ? {
          fontWeight: "bold",
          color: "success.main",
        }
      : {};
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "completed":
        return { color: "success.main", fontWeight: "bold" };
      case "in-progress":
        return { color: "warning.main", fontWeight: "bold" };
      case "postponed":
      case "cancelled":
        return { color: "error.main", fontStyle: "italic" };
      case "walkover":
        return { color: "info.main", fontStyle: "italic" };
      default:
        return { color: "text.secondary" };
    }
  };

  const translateStatus = (status) => {
    switch (status) {
      case "scheduled":
        return "Programado";
      case "pending":
        return "Pendiente";
      case "in-progress":
        return "En progreso";
      case "completed":
        return "Completado";
      case "postponed":
        return "Aplazado";
      case "cancelled":
        return "Cancelado";
      case "walkover":
        return "Walkover";
      default:
        return status;
    }
  };

  return (
    <Box>
      {Object.entries(bracket).map(([round, matches]) => (
        <Box key={round} mb={4}>
          <Typography variant="h6" gutterBottom>
            {round === "final"
              ? "Final"
              : round === "semi-finals"
              ? "Semifinales"
              : round === "quarter-finals"
              ? "Cuartos de Final"
              : round === "round-of-16"
              ? "Octavos de Final"
              : round === "round-of-32"
              ? "Dieciseisavos de Final"
              : `Ronda ${round}`}
          </Typography>

          <Box display="flex" flexDirection="column" gap={2}>
            {matches.map((match) => (
              <Paper key={match._id} elevation={3} sx={{ p: 2 }}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography sx={getWinnerStyle(match, match.team1?._id)}>
                    {match.team1?.name || "Por definir"}
                  </Typography>
                  <Typography>vs</Typography>
                  <Typography sx={getWinnerStyle(match, match.team2?._id)}>
                    {match.team2?.name || "Por definir"}
                  </Typography>
                </Box>

                {/* Walkover */}
                {match.status === "walkover" && match.winner && (
                  <Typography textAlign="center" color="info.main">
                    Ganador por walkover: {match.winner.name}
                  </Typography>
                )}

                {/* Resultado principal */}
                {(match.status === "completed" ||
                  match.status === "in-progress") && (
                  <>
                    {match.scoreTeam1 !== null && match.scoreTeam2 !== null && (
                      <Typography textAlign="center" mt={1}>
                        Resultado Global: {match.scoreTeam1} - {match.scoreTeam2}
                      </Typography>
                    )}
                    {match.seriesWinner && (
                      <Typography
                        textAlign="center"
                        fontWeight="bold"
                        color="success.main"
                      >
                        Ganador de la serie: {match.seriesWinner.name}
                      </Typography>
                    )}
                  </>
                )}

                {/* Partido cancelado/aplazado */}
                {(match.status === "cancelled" ||
                  match.status === "postponed") && (
                  <Typography textAlign="center" fontStyle="italic">
                    {match.status === "cancelled"
                      ? "Este partido ha sido cancelado"
                      : "Este partido ha sido aplazado"}
                  </Typography>
                )}

                {/* Series matches */}
                {match.isBestOfSeries && match.seriesMatches?.length > 0 && (
                  <Box mt={2}>
                    <Typography variant="subtitle2" gutterBottom>
                      Partidos de la serie:
                    </Typography>
                    <Box display="flex" flexDirection="column" gap={1}>
                      {match.seriesMatches.map((game, index) => (
                        <Box
                          key={game._id}
                          display="flex"
                          justifyContent="space-between"
                        >
                          <Typography variant="body2">
                            Partido {index + 1}:
                          </Typography>
                          <Typography variant="body2">
                            {game.scoreTeam1 ?? "-"} - {game.scoreTeam2 ?? "-"}
                            {game.winner && (
                              <Typography
                                component="span"
                                ml={1}
                                color="success.main"
                              >
                                (Ganador:{" "}
                                {game.winner === match.team1?._id
                                  ? match.team1?.name
                                  : match.team2?.name}
                                )
                              </Typography>
                            )}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                    {/* Estado del partido */}
                    <Typography
                      mt={1}
                      textAlign="center"
                      sx={getStatusStyle(match.status)}
                    >
                      {translateStatus(match.status)}
                    </Typography>
                  </Box>
                )}
              </Paper>
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default TournamentPairings;
