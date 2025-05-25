import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
} from "@mui/material";

const EliminationStage = ({
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

                {match.status === "walkover" && match.winner && (
                  <Typography textAlign="center" color="info.main">
                    Ganador por walkover: {match.winner.name}
                  </Typography>
                )}

                {(match.status === "completed" ||
                  match.status === "in-progress") && (
                  <>
                    {match.scoreTeam1 !== null && match.scoreTeam2 !== null && (
                      <Typography textAlign="center" mt={1}>
                        Resultado Global: {match.scoreTeam1} -{" "}
                        {match.scoreTeam2}
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

                {(match.status === "cancelled" ||
                  match.status === "postponed") && (
                  <Typography textAlign="center" fontStyle="italic">
                    {match.status === "cancelled"
                      ? "Este partido ha sido cancelado"
                      : "Este partido ha sido aplazado"}
                  </Typography>
                )}

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

export default EliminationStage;
