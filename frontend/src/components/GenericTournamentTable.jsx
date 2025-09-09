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
import { formatDate } from "../utils/formatDate";
import { statusMapping } from "../utils/tournamentStatusMapping";
import { useNavigate } from "react-router-dom";

const GenericTournamentTable = ({
  tournaments,
  actionIcon,
  actionTooltip,
  actionRoute,
  onActionClick,
}) => {
  const navigate = useNavigate();

  return (
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
              <strong>Fechas de Torneo</strong>
            </TableCell>
            <TableCell>
              <strong style={{ marginRight: "3px" }}>Estado</strong>
            </TableCell>
            <TableCell>
              <strong>{actionTooltip}</strong>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tournaments.map((t) => (
            <TableRow key={t._id}>
              <TableCell>{t.name}</TableCell>
              <TableCell>{t.sport?.name || "N/A"}</TableCell>
              <TableCell>
                {formatDate(t.startDate)} - {formatDate(t.endDate)}
              </TableCell>
              <TableCell>{statusMapping(t.status)}</TableCell>
              <TableCell>
                <Tooltip title={actionTooltip}>
                  <IconButton
                    onClick={() =>
                      onActionClick
                        ? onActionClick(t)
                        : navigate(`/torneo/${t._id}${actionRoute}`)
                    }
                    color="primary"
                  >
                    {actionIcon}
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default GenericTournamentTable;
