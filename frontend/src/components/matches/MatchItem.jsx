import { useState } from "react";
import { Box, Typography, Button, Chip } from "@mui/material";
import DescriptionWithToggle from "./DescriptionWithToggle";
import { formatDate, formatTimeTo12h } from "../../utils/formatDate";
import { translateStatus } from "../../utils/translations";
import { isScorersSupported } from "../../services/scorersService";
import AddScorersModal from "./AddScorersModal";

const MatchItem = ({
  match,
  user,
  onEditClick,
  onAddSeriesGame,
  isElimination,
  fetchMatchDetails,
}) => {
  // Verificar si el partido es de fútbol o fútbol sala
  const isFootballOrFutsal = isScorersSupported(match?.tournament?.sport?.name);

  // Verificar si es fase de grupos
  const isGroupStage = !isElimination;

  // Verificar si el partido está completado
  const isCompleted = match.status === "completed";

  // Verificar si el usuario tiene permisos
  const hasPermission = user?.role === "admin" || user?.role === "assistant";

  // Validación completa para mostrar el botón de goleadores
  const canAddScorers =
    isFootballOrFutsal && isGroupStage && isCompleted && hasPermission;

  const [openScorersModal, setOpenScorersModal] = useState(false);

  const renderSeriesGames = () => {
    const canAddMoreGames =
      match.status !== "completed" &&
      (!match.tournament?.bestOfMatches ||
        match.seriesMatches?.length < match.tournament.bestOfMatches);

    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          <strong>Partidos de la serie:</strong>
        </Typography>
        {match.seriesMatches?.map((game, index) => (
          <Box
            key={index}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              mb: 1,
              p: 1,
              backgroundColor: "#f5f5f5",
              borderRadius: 1,
            }}
          >
            <Typography variant="body2">
              Juego {index + 1}: {game.scoreTeam1 ?? "-"} -{" "}
              {game.scoreTeam2 ?? "-"}
            </Typography>
          </Box>
        ))}
        {(user?.role === "admin" || user?.role === "assistant") &&
          canAddMoreGames && (
            <Button
              variant="outlined"
              size="small"
              sx={{ mt: 1 }}
              onClick={() => onAddSeriesGame(match)}
            >
              Agregar Juego
            </Button>
          )}
      </Box>
    );
  };

  const renderScorers = () => {
    if (!match.scorers || match.scorers.length === 0) return null;

    return (
      <Box
        sx={{
          mt: 2,
          p: 2,
          backgroundColor: "#f8f8f8",
          borderRadius: 1,
          border: "1px solid #eee",
          width: "100%", // Esto asegura que ocupe todo el ancho disponible
        }}
      >
        <Typography variant="subtitle2" gutterBottom fontWeight="bold">
          Goles del partido:
        </Typography>

        <Box sx={{ display: "flex", gap: 4, width: "100%" }}>
          {/* Equipo 1 */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {" "}
            {/* minWidth: 0 evita overflow */}
            <Typography variant="body1" fontWeight="medium" color="primary">
              {match.team1.name}
            </Typography>
            <Box component="ul" sx={{ pl: 2, mt: 1, mb: 0 }}>
              {match.scorers
                .filter(
                  (s) =>
                    s.teamId === match.team1._id ||
                    (typeof s.teamId === "object" &&
                      s.teamId._id === match.team1._id)
                )
                .map((scorer, index) => {
                  const playerName =
                    scorer.playerId?.fullName ||
                    (scorer.playerId?.firstName && scorer.playerId?.lastName
                      ? `${scorer.playerId.firstName} ${scorer.playerId.lastName}`
                      : "Jugador desconocido");
                  return (
                    <Box component="li" key={index} sx={{ py: 0.5 }}>
                      <Typography variant="body2" noWrap={false}>
                        <strong>{playerName}</strong>: {scorer.goals} gol
                        {scorer.goals !== 1 ? "es" : ""}
                      </Typography>
                    </Box>
                  );
                })}
            </Box>
          </Box>

          {/* Equipo 2 */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body1" fontWeight="medium" color="primary">
              {match.team2.name}
            </Typography>
            <Box component="ul" sx={{ pl: 2, mt: 1, mb: 0 }}>
              {match.scorers
                .filter(
                  (s) =>
                    s.teamId === match.team2._id ||
                    (typeof s.teamId === "object" &&
                      s.teamId._id === match.team2._id)
                )
                .map((scorer, index) => {
                  const playerName =
                    scorer.playerId?.fullName ||
                    (scorer.playerId?.firstName && scorer.playerId?.lastName
                      ? `${scorer.playerId.firstName} ${scorer.playerId.lastName}`
                      : "Jugador desconocido");
                  return (
                    <Box component="li" key={index} sx={{ py: 0.5 }}>
                      <Typography variant="body2" noWrap={false}>
                        <strong>{playerName}</strong>: {scorer.goals} gol
                        {scorer.goals !== 1 ? "es" : ""}
                      </Typography>
                    </Box>
                  );
                })}
            </Box>
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <Box
      sx={{
        mb: 2,
        p: 2,
        borderBottom: "1px solid #eee",
        "&:last-child": { borderBottom: "none" },
        position: "relative",
      }}
    >
      {(user?.role === "admin" || user?.role === "assistant") && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            position: "absolute",
            right: 8,
            top: 8,
          }}
        >
          <Button size="small" onClick={() => onEditClick(match)}>
            Actualizar
          </Button>

          {canAddScorers && (
            <Button
              size="small"
              variant="outlined"
              color="success"
              onClick={() => setOpenScorersModal(true)}
            >
              Agregar Goleadores
            </Button>
          )}
        </Box>
      )}

      <Typography variant="h6" gutterBottom>
        {match.team1?.name || "Por definir"} vs{" "}
        {match.team2?.name || "Por definir"}
      </Typography>

      <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
        {!isElimination && (
          <Typography variant="body2">
            <strong>Grupo:</strong> {match.group}
          </Typography>
        )}
        <Typography variant="body2">
          <strong>Estado:</strong> {translateStatus(match.status)}
        </Typography>
        <Typography variant="body2">
          <strong>Fecha:</strong>{" "}
          {match.date ? formatDate(match.date) : "Por definir"}
        </Typography>
        <Typography variant="body2">
          <strong>Hora:</strong>{" "}
          {match.time ? formatTimeTo12h(match.time) : "Por definir"}
        </Typography>
        <DescriptionWithToggle description={match.description} />
        {match.status === "completed" && (
          <Box
            sx={{
              position: "relative",
              top: "-15px",
              px: 2,
              py: 1,
              bgcolor: "#e0f7fa",
              borderRadius: 2,
              border: "1px solid #b2ebf2",
            }}
          >
            <Typography
              variant="body2"
              sx={{ fontWeight: "bold", color: "#00796b" }}
            >
              Resultado: {match.scoreTeam1} - {match.scoreTeam2}
            </Typography>
          </Box>
        )}

        {renderScorers()}
      </Box>

      {isElimination && match.seriesMatches && renderSeriesGames()}

      <AddScorersModal
        open={openScorersModal}
        onClose={() => setOpenScorersModal(false)}
        match={match}
        fetchMatchDetails={fetchMatchDetails}
      />
    </Box>
  );
};

export default MatchItem;
