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

const TournamentModal = ({ open, loading, tournament, onClose }) => (
  <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
    <DialogTitle color="primary" fontWeight="bold">
      Detalles del Torneo
    </DialogTitle>
    <DialogContent dividers>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" py={3}>
          <CircularProgress />
        </Box>
      ) : tournament ? (
        <Box>
          <Typography>
            <strong>Nombre:</strong> {tournament.name}
          </Typography>
          <Typography>
            <strong>Descripción:</strong> {tournament.description}
          </Typography>
          <Typography>
            <strong>Deporte:</strong> {tournament.sport?.name}
          </Typography>
          <Typography>
            <strong>Fecha de registro:</strong>{" "}
            {formatDate(tournament.registrationStart)} -{" "}
            {formatDate(tournament.registrationEnd)}
          </Typography>
          <Typography>
            <strong>Fecha del torneo:</strong>{" "}
            {formatDate(tournament.startDate)} -{" "}
            {formatDate(tournament.endDate)}
          </Typography>
          <Typography>
            <strong>Cantidad de equipos:</strong> {tournament.maxTeams}
          </Typography>
          <Typography>
            <strong>Mínimo jugadores por equipo:</strong>{" "}
            {tournament.minPlayersPerTeam}
          </Typography>
          <Typography>
            <strong>Máximo jugadores por equipo:</strong>{" "}
            {tournament.maxPlayersPerTeam}
          </Typography>
          <Typography>
            <strong>Estado:</strong> {tournament.status}
          </Typography>
        </Box>
      ) : open ? (
        <Typography color="error">No se pudieron cargar los datos</Typography>
      ) : null}
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cerrar</Button>
    </DialogActions>
  </Dialog>
);

export default TournamentModal;
