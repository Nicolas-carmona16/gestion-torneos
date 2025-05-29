import { Box, Typography, Button, Chip } from "@mui/material";
import DescriptionWithToggle from "./DescriptionWithToggle";
import { formatDate, formatTimeTo12h } from "../../utils/formatDate";
import { translateStatus } from "../../utils/translations";

const MatchItem = ({
  match,
  user,
  onEditClick,
  onAddSeriesGame,
  isElimination,
}) => {
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
        <Button
          size="small"
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
          }}
          onClick={() => onEditClick(match)}
        >
          Actualizar
        </Button>
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
      </Box>

      {isElimination && match.seriesMatches && renderSeriesGames()}
    </Box>
  );
};

export default MatchItem;
