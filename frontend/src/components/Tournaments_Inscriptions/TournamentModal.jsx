import {
  Box,
  Typography,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  Tooltip,
} from "@mui/material";
import { formatDate } from "../../utils/formatDate";
import BasketballRules from "../sportsRules/BasketballRules";
import SoccerRules from "../sportsRules/SoccerRules";
import VolleyballRules from "../sportsRules/VolleyballRules";
import FutsalRules from "../sportsRules/FutsalRules";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getTeamsByTournament } from "../../services/teamService";

const rulesComponents = {
  Baloncesto: BasketballRules,
  Fútbol: SoccerRules,
  Voleibol: VolleyballRules,
  "Fútbol Sala": FutsalRules,
};

const formatMapping = {
  elimination: "Eliminación Directa",
  "group-stage": "Fase de Grupos",
};

const TournamentModal = ({
  open,
  loading,
  tournament,
  onClose,
  currentUser,
}) => {
  const navigate = useNavigate();
  const [isFull, setIsFull] = useState(false);
  const [teamsLoading, setTeamsLoading] = useState(false);
  const SportRulesComponent = rulesComponents[tournament?.sport?.name] || null;

  useEffect(() => {
    const fetchTeams = async () => {
      if (!tournament?._id || !tournament?.maxTeams) return;

      setTeamsLoading(true);
      try {
        const teamsData = await getTeamsByTournament(tournament._id);
        setIsFull(teamsData.teams.length >= tournament.maxTeams);
      } catch (error) {
        console.error("Error fetching teams:", error);
      } finally {
        setTeamsLoading(false);
      }
    };

    if (open && tournament) {
      fetchTeams();
    }
  }, [tournament, open]);

  const isRegistrationOpen = () => {
    if (!tournament) return false;

    const currentDate = new Date();
    return (
      currentDate >= new Date(tournament.registrationStart) &&
      currentDate <= new Date(tournament.registrationTeamEnd)
    );
  };

  const isUserCaptain = () => {
    return currentUser?.role === "captain";
  };

  const isTournamentAvailableForUser = () => {
    if (!currentUser || !tournament || !currentUser.tournaments) return false;
    const currentTournamentId = tournament._id?.toString();
    const userTournamentIds = currentUser.tournaments.map((t) => {
      return t?._id?.toString() || t?.toString();
    });

    return userTournamentIds.includes(currentTournamentId);
  };

  const handleRegisterClick = () => {
    onClose();
    navigate(`/torneo/${tournament._id}/registro`);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      disableRestoreFocus
    >
      <DialogTitle color="primary" fontWeight="bold">
        Detalles del Torneo
        {tournament?.isOlympiad && (
          <Chip
            label="Olimpiada"
            color="secondary"
            size="small"
            variant="outlined"
            sx={{ ml: 2 }}
          />
        )}
      </DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <Box className="flex justify-center items-center py-6">
            <CircularProgress />
          </Box>
        ) : tournament ? (
          <Box className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Box className="space-y-2">
              <Typography className="text-gray-700 text-sm">
                <strong>Nombre:</strong> {tournament.name}
              </Typography>
              <Typography className="text-gray-700 text-sm break-words">
                <strong>Descripción:</strong> {tournament.description}
              </Typography>
              <Typography className="text-gray-700 text-sm">
                <strong>Deporte:</strong> {tournament.sport?.name}
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography className="text-gray-700">
                  <strong>Formato:</strong> {formatMapping[tournament.format]}
                </Typography>
                {tournament.bestOfMatches > 1 && (
                  <Tooltip
                    title={
                      <Typography sx={{ fontSize: "14px" }}>
                        Estos son los partidos por fase en eliminación directa.
                        Si esta en fase de grupos, luego verás enfrentamientos
                        de eliminación directa, y estos son los partidos que se
                        jugarán en cada uno.
                      </Typography>
                    }
                  >
                    <Chip
                      label={`Mejor de ${tournament.bestOfMatches}`}
                      size="small"
                    />
                  </Tooltip>
                )}
              </Box>
              <Box>
                <Typography className="text-gray-700">
                  <strong>Fechas de registro:</strong>
                </Typography>
                <Typography className="text-gray-700 ml-4">
                  <strong>Equipos:</strong>{" "}
                  {formatDate(tournament.registrationStart)} -{" "}
                  {formatDate(tournament.registrationTeamEnd)}
                </Typography>
                <Typography className="text-gray-700 ml-4">
                  <strong>Jugadores:</strong> hasta{" "}
                  {formatDate(tournament.registrationPlayerEnd)}
                </Typography>
              </Box>
            </Box>
            <Box className="space-y-2">
              <Typography className="text-gray-700 text-sm">
                <strong>Fecha del torneo:</strong>{" "}
                {formatDate(tournament.startDate)} -{" "}
                {formatDate(tournament.endDate)}
              </Typography>
              <Typography className="text-gray-700 text-sm">
                <strong>Cantidad de equipos:</strong> {tournament.maxTeams}
              </Typography>
              <Typography className="text-gray-700">
                <strong>Jugadores por equipo:</strong>{" "}
                {tournament.minPlayersPerTeam} - {tournament.maxPlayersPerTeam}
              </Typography>
              {tournament.format === "group-stage" &&
                tournament.groupsStageSettings && (
                  <Box>
                    <Typography variant="subtitle2" color="primary">
                      Configuración de Fase de Grupos
                    </Typography>
                    <Typography className="text-gray-700 text-sm">
                      <strong>Equipos por grupo:</strong>{" "}
                      {tournament.groupsStageSettings.teamsPerGroup}
                    </Typography>
                    <Typography className="text-gray-700 text-sm">
                      <strong>Equipos que avanzan:</strong>{" "}
                      {tournament.groupsStageSettings.teamsAdvancingPerGroup}
                    </Typography>
                    <Typography className="text-gray-700 text-sm">
                      <strong>Partidos por equipo:</strong>{" "}
                      {tournament.groupsStageSettings.matchesPerTeamInGroup === "single" 
                        ? "Solo ida" 
                        : "Ida y vuelta"}
                    </Typography>
                  </Box>
                )}
            </Box>
          </Box>
        ) : open ? (
          <Typography color="error">No se pudieron cargar los datos</Typography>
        ) : null}

        {SportRulesComponent && tournament?.customRules && (
          <Box className="mt-6">
            <Typography variant="h6" color="primary" gutterBottom>
              Reglas del Torneo
            </Typography>
            <SportRulesComponent rules={tournament.customRules} />
          </Box>
        )}
      </DialogContent>

      <DialogActions className="px-6 py-4 flex justify-between">
        <Button onClick={onClose} variant="outlined">
          Cerrar
        </Button>
        {isRegistrationOpen() &&
          isUserCaptain() &&
          isTournamentAvailableForUser() && (
            <Tooltip
              title={
                <Typography sx={{ fontSize: "14px" }}>
                  {isFull
                    ? "Este torneo ya ha alcanzado el número máximo de equipos permitidos"
                    : ""}
                </Typography>
              }
              arrow
              disableHoverListener={!isFull}
            >
              <span>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleRegisterClick}
                  disabled={teamsLoading || isFull}
                  sx={{
                    "&:disabled": {
                      backgroundColor: isFull
                        ? "rgba(0, 0, 0, 0.12)"
                        : undefined,
                      color: isFull ? "rgba(0, 0, 0, 0.26)" : undefined,
                    },
                  }}
                >
                  {teamsLoading ? "Cargando..." : "Inscribirse"}
                </Button>
              </span>
            </Tooltip>
          )}
      </DialogActions>
    </Dialog>
  );
};

export default TournamentModal;
