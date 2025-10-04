import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Button,
  CircularProgress,
  Tooltip,
  Alert,
  Tabs,
  Tab,
} from "@mui/material";
import { useState, useEffect } from "react";
import {
  checkGroupStageCompletion,
  createPlayoffBracket,
  checkPlayoffStatus,
} from "../../services/groupStageService";
import { getEliminationBracket } from "../../services/eliminationStageService";
import EliminationStage from "./EliminationStage";

const GroupStage = ({
  standings,
  teamsAdvancing,
  onGenerateGroups,
  generatingGroups,
  generationError,
  user,
  tournament,
  tournamentId,
}) => {
  const [groupStageComplete, setGroupStageComplete] = useState(false);
  const [completionData, setCompletionData] = useState(null);
  const [playoffStatus, setPlayoffStatus] = useState(null);
  const [generatingPlayoff, setGeneratingPlayoff] = useState(false);
  const [playoffError, setPlayoffError] = useState(null);
  const [playoffSuccess, setPlayoffSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [playoffBracket, setPlayoffBracket] = useState(null);
  const [loadingPlayoffBracket, setLoadingPlayoffBracket] = useState(false);

  const showDrawsColumn =
    tournament?.sport?.name === "Fútbol" ||
    tournament?.sport?.name === "Fútbol Sala";

  const isFootballSport =
    tournament?.sport?.name === "Fútbol" ||
    tournament?.sport?.name === "Fútbol Sala";

  const isVolleyball = tournament?.sport?.name === "Voleibol";

  useEffect(() => {
    const checkStatus = async () => {
      if (Object.keys(standings).length > 0) {
        try {
          const [completion, playoff] = await Promise.all([
            checkGroupStageCompletion(tournamentId),
            checkPlayoffStatus(tournamentId),
          ]);

          setCompletionData(completion);
          setPlayoffStatus(playoff);
          setGroupStageComplete(completion.isComplete);

          if (playoff.hasPlayoff) {
            setLoadingPlayoffBracket(true);
            try {
              const bracketData = await getEliminationBracket(tournamentId);
              setPlayoffBracket(bracketData);
            } catch (error) {
              console.error("Error cargando bracket del playoff:", error);
            } finally {
              setLoadingPlayoffBracket(false);
            }
          }
        } catch (error) {
          console.error("Error verificando estado:", error);
        }
      }
    };

    checkStatus();
  }, [standings, tournamentId]);

  const handleGeneratePlayoff = async () => {
    try {
      setGeneratingPlayoff(true);
      setPlayoffError(null);
      setPlayoffSuccess(false);

      await createPlayoffBracket(tournamentId);
      setPlayoffSuccess(true);

      setLoadingPlayoffBracket(true);
      try {
        const bracketData = await getEliminationBracket(tournamentId);
        setPlayoffBracket(bracketData);
        setActiveTab(1);
      } catch (error) {
        console.error("Error cargando bracket del playoff:", error);
      } finally {
        setLoadingPlayoffBracket(false);
      }

      const newPlayoffStatus = await checkPlayoffStatus(tournamentId);
      setPlayoffStatus(newPlayoffStatus);
    } catch (error) {
      console.error("Error generating playoff:", error);
      setPlayoffError(
        error.response?.data?.error || "Error al generar el playoff"
      );
    } finally {
      setGeneratingPlayoff(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

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

  const showPlayoffTab = playoffStatus?.hasPlayoff || groupStageComplete;
  const tabs = [
    { label: "Tabla de Posiciones", value: 0 },
    ...(showPlayoffTab ? [{ label: "Eliminación Directa", value: 1 }] : []),
  ];

  return (
    <Box>
      {completionData && playoffStatus && (
        <Box mb={3}>
          <Alert
            severity={groupStageComplete ? "success" : "info"}
            sx={{ mb: 2 }}
          >
            <Typography variant="body2">
              Progreso fase de grupos: {completionData.completedMatches} de{" "}
              {completionData.totalMatches} partidos completados (
              {completionData.completionPercentage.toFixed(1)}%)
            </Typography>
          </Alert>

          {playoffStatus.hasPlayoff && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body1">
                Fase eliminatoria ya generada (
                {playoffStatus.playoffMatchesCount} partidos)
              </Typography>
            </Alert>
          )}

          {groupStageComplete &&
            !playoffStatus.hasPlayoff &&
            user?.role === "admin" && (
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                gap={2}
              >
                <Alert severity="success" sx={{ width: "100%" }}>
                  <Typography variant="body1" fontWeight="bold">
                    ¡Fase de grupos completada! Ya puedes generar la fase
                    eliminatoria.
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Equipos que avanzarán:{" "}
                    {Object.keys(standings).length * teamsAdvancing} equipos (
                    {teamsAdvancing} por grupo)
                  </Typography>
                </Alert>

                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  onClick={handleGeneratePlayoff}
                  disabled={generatingPlayoff}
                  sx={{ mt: 1 }}
                >
                  {generatingPlayoff ? (
                    <>
                      <CircularProgress size={24} color="inherit" />
                      <Box ml={2}>Generando Fase Eliminatoria...</Box>
                    </>
                  ) : (
                    "Generar Fase Eliminatoria"
                  )}
                </Button>

                {playoffError && (
                  <Alert severity="error" sx={{ width: "100%" }}>
                    {playoffError}
                  </Alert>
                )}

                {playoffSuccess && (
                  <Alert severity="success" sx={{ width: "100%" }}>
                    ¡Fase eliminatoria generada exitosamente!
                  </Alert>
                )}
              </Box>
            )}

          {!groupStageComplete && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="body2">{playoffStatus.reason}</Typography>
            </Alert>
          )}
        </Box>
      )}

      {/* Tabs */}
      {showPlayoffTab && (
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            centered
            indicatorColor="primary"
            textColor="primary"
          >
            {tabs.map((tab) => (
              <Tab key={tab.value} label={tab.label} />
            ))}
          </Tabs>
        </Box>
      )}

      {/* Contenido de los tabs */}
      {activeTab === 0 && (
        <Box>
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
                      <Tooltip title="Puntos">
                        <TableCell align="right">Pts</TableCell>
                      </Tooltip>
                      <Tooltip title="Partidos Jugados">
                        <TableCell align="right">PJ</TableCell>
                      </Tooltip>
                      <Tooltip title="Partidos Ganados">
                        <TableCell align="right">PG</TableCell>
                      </Tooltip>
                      {showDrawsColumn && (
                        <Tooltip title="Partidos Empatados">
                          <TableCell align="right">PE</TableCell>
                        </Tooltip>
                      )}
                      <Tooltip title="Partidos Perdidos">
                        <TableCell align="right">PP</TableCell>
                      </Tooltip>
                      <Tooltip
                        title={
                          isVolleyball
                            ? "Sets a Favor"
                            : isFootballSport
                            ? "Goles a Favor"
                            : "Puntos Anotados"
                        }
                      >
                        <TableCell align="right">
                          {isVolleyball ? "SF" : isFootballSport ? "GF" : "PA"}
                        </TableCell>
                      </Tooltip>
                      <Tooltip
                        title={
                          isVolleyball
                            ? "Sets en Contra"
                            : isFootballSport
                            ? "Goles en Contra"
                            : "Puntos Recibidos"
                        }
                      >
                        <TableCell align="right">
                          {isVolleyball ? "SC" : isFootballSport ? "GC" : "PR"}
                        </TableCell>
                      </Tooltip>
                      <Tooltip
                        title={
                          isVolleyball
                            ? "Diferencia de Sets"
                            : isFootballSport
                            ? "Diferencia de Goles"
                            : "Diferencia de Puntos"
                        }
                      >
                        <TableCell align="right">
                          {isVolleyball ? "DS" : isFootballSport ? "DG" : "DP"}
                        </TableCell>
                      </Tooltip>
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
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          {typeof team.team === "object" ? (
                            team.team.name
                          ) : (
                            <Typography color="textSecondary">
                              Equipo no encontrado
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <strong>{team.points}</strong>
                        </TableCell>
                        <TableCell align="right">{team.played}</TableCell>
                        <TableCell align="right">{team.wins}</TableCell>
                        {showDrawsColumn && (
                          <TableCell align="right">{team.draws}</TableCell>
                        )}
                        <TableCell align="right">{team.losses}</TableCell>
                        {isVolleyball ? (
                          <>
                            <TableCell align="right">
                              {team.setsFor || 0}
                            </TableCell>
                            <TableCell align="right">
                              {team.setsAgainst || 0}
                            </TableCell>
                            <TableCell align="right">
                              {(team.setsFor || 0) - (team.setsAgainst || 0)}
                            </TableCell>
                          </>
                        ) : (
                          <>
                            <TableCell align="right">{team.goalsFor}</TableCell>
                            <TableCell align="right">
                              {team.goalsAgainst}
                            </TableCell>
                            <TableCell align="right">
                              {team.goalsFor - team.goalsAgainst}
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            </Box>
          ))}
        </Box>
      )}

      {activeTab === 1 && (
        <Box>
          {loadingPlayoffBracket ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : playoffBracket ? (
            <EliminationStage
              user={user}
              bracket={playoffBracket}
              isPlayoff={true}
            />
          ) : (
            <Typography align="center" color="textSecondary">
              No se pudo cargar el bracket de eliminacion directa
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default GroupStage;
