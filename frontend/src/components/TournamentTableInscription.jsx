import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import { HowToReg } from "@mui/icons-material";
import { formatDate } from "../utils/formatDate";
import { statusMapping } from "../utils/tournamentStatusMapping";
import InfoOutlineIcon from "@mui/icons-material/InfoOutline";
import { Edit, Delete } from "@mui/icons-material";

const TournamentTableInscription = ({
  tournaments,
  onViewDetails,
  onDeleteTournament,
  handleEditTournament,
  user,
}) => (
  <TableContainer component={Paper}>
    <Table>
      <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
        <TableRow>
          <TableCell>
            <strong>Nombre del torneo</strong>
          </TableCell>
          <TableCell>
            <strong>Deporte</strong>
          </TableCell>
          <TableCell>
            <strong>Fecha inicio Registro</strong>
          </TableCell>
          <TableCell>
            <strong>Fecha Fin Registro de Equipos</strong>
          </TableCell>
          <TableCell>
            <strong>Fecha Fin Registro de Jugadores</strong>
          </TableCell>
          <TableCell>
            <strong>Fechas de Torneo</strong>
          </TableCell>
          <TableCell>
            <strong style={{ marginRight: "3px" }}>Estado</strong>
            <Tooltip
              title={
                <Typography sx={{ fontSize: "14px" }}>
                  Si el estado está en próximamente, la inscripción no ha
                  comenzado. Si el estado está en registro abierto, el torneo
                  está en proceso de registro de equipos. Si el estado está en
                  ajuste de jugadores, el torneo está en proceso de ajuste de
                  jugadores. Si el estado está en preparación, ya se acabó el
                  ajuste de jugadores y el torneo está próximo a empezar. Si el
                  estado está en curso, el torneo está en progreso. Si el estado
                  está en finalizado, el torneo ha terminado.
                </Typography>
              }
            >
              <InfoOutlineIcon
                style={{ fontSize: "16px", marginBottom: "2px" }}
              />
            </Tooltip>
          </TableCell>
          <TableCell>
            <strong>Inscripción</strong>
          </TableCell>
          {user?.role === "admin" && (
            <TableCell>
              <strong>Acciones</strong>
            </TableCell>
          )}
        </TableRow>
      </TableHead>
      <TableBody>
        {tournaments.map((t) => (
          <TableRow key={t._id}>
            <TableCell>{t.name}</TableCell>
            <TableCell>{t.sport?.name || "N/A"}</TableCell>
            <TableCell>{formatDate(t.registrationStart)}</TableCell>
            <TableCell>{formatDate(t.registrationTeamEnd)}</TableCell>
            <TableCell>{formatDate(t.registrationPlayerEnd)}</TableCell>
            <TableCell>
              {formatDate(t.startDate)} - {formatDate(t.endDate)}
            </TableCell>
            <TableCell>{statusMapping(t.status)}</TableCell>
            <TableCell>
              <Tooltip title="Inscribirse">
                <IconButton
                  onClick={() => onViewDetails(t._id)}
                  color={t.status === "registration open" ? "primary" : "error"}
                >
                  <HowToReg />
                </IconButton>
              </Tooltip>
            </TableCell>
            {user?.role === "admin" && (
              <TableCell>
                <Tooltip title="Editar">
                  <IconButton
                    color="primary"
                    onClick={() => handleEditTournament(t)}
                  >
                    <Edit />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Eliminar">
                  <IconButton
                    onClick={() => onDeleteTournament(t._id)}
                    color="secondary"
                  >
                    <Delete />
                  </IconButton>
                </Tooltip>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

export default TournamentTableInscription;
