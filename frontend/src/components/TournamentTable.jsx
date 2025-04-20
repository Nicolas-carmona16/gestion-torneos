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
} from "@mui/material";
import { HowToReg } from "@mui/icons-material";
import { formatDate } from "../utils/formatDate";
import { statusMapping } from "../utils/tournamentStatusMapping";
import InfoOutlineIcon from "@mui/icons-material/InfoOutline";
import { Edit, Delete } from "@mui/icons-material";

const TournamentTable = ({
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
            <strong>Fechas de Registro</strong>
          </TableCell>
          <TableCell>
            <strong>Fechas de Torneo</strong>
          </TableCell>
          <TableCell>
            <strong style={{ marginRight: "3px" }}>Estado</strong>
            <Tooltip title="Si el estado está en pendiente, la inscripción no ha comenzado o ya finalizó la inscripción y el torneo no ha iniciado. Si el estado está en registro, el torneo está en proceso de inscripción. Si el estado está activo, el torneo ya ha comenzado. Si el estado está finalizado, el torneo ya ha terminado.">
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
            <TableCell>
              {formatDate(t.registrationStart)} -{" "}
              {formatDate(t.registrationEnd)}
            </TableCell>
            <TableCell>
              {formatDate(t.startDate)} - {formatDate(t.endDate)}
            </TableCell>
            <TableCell>{statusMapping(t.status)}</TableCell>
            <TableCell>
              <Tooltip title="Inscribirse">
                <IconButton
                  onClick={() => onViewDetails(t._id)}
                  color={t.status === "registration" ? "primary" : "error"}
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

export default TournamentTable;
