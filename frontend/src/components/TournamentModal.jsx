import {
  Box,
  Typography,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { formatDate } from "../utils/formatDate";
import BasketballRules from "./sportsRules/BasketballRules";
import SoccerRules from "./sportsRules/SoccerRules";
import VolleyballRules from "./sportsRules/VolleyballRules";
import FutsalRules from "./sportsRules/FutsalRules";

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

const TournamentModal = ({ open, loading, tournament, onClose }) => {
  const SportRulesComponent = rulesComponents[tournament?.sport?.name] || null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle color="primary" fontWeight="bold">
        Detalles del Torneo
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
              <Typography className="text-gray-700 text-sm">
                <strong>Formato:</strong> {formatMapping[tournament.format]}
              </Typography>
              <Typography className="text-gray-700 text-sm">
                <strong>Fecha de registro:</strong>{" "}
                {formatDate(tournament.registrationStart)} -{" "}
                {formatDate(tournament.registrationEnd)}
              </Typography>
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
              <Typography className="text-gray-700 text-sm">
                <strong>Mínimo de jugadores por equipo:</strong>{" "}
                {tournament.minPlayersPerTeam}
              </Typography>
              <Typography className="text-gray-700 text-sm">
                <strong>Máximo de jugadores por equipo:</strong>{" "}
                {tournament.maxPlayersPerTeam}
              </Typography>
            </Box>
          </Box>
        ) : open ? (
          <Typography color="error">No se pudieron cargar los datos</Typography>
        ) : null}

        {SportRulesComponent && tournament?.customRules && (
          <Box className="mt-6">
            <Typography variant="h6" color="primary" gutterBottom>
              Reglas del Torneo de {tournament.sport?.name}
            </Typography>
            <SportRulesComponent rules={tournament.customRules} />
          </Box>
        )}
      </DialogContent>

      <DialogActions className="px-6 py-4 flex justify-between">
        <Button onClick={onClose} variant="outlined">
          Cerrar
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => console.log("Redirigir a inscripción")}
        >
          Inscribirse
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TournamentModal;
