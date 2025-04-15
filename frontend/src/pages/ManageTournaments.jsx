import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import { HowToReg } from "@mui/icons-material";
import { useEffect, useState } from "react";
import {
  getAllTournaments,
  getTournamentById,
} from "../services/tournamentService";

const formatDate = (dateString) =>
  dateString ? new Date(dateString).toLocaleDateString() : "N/A";

const ManageTournaments = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const data = await getAllTournaments();
        setTournaments(data);
      } catch (error) {
        console.error("Error al cargar torneos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTournaments();
  }, []);

  const handleOpenModal = async (id) => {
    setDetailLoading(true);
    try {
      const data = await getTournamentById(id);
      setSelectedTournament(data);
      setModalOpen(true);
    } catch (error) {
      console.error("Error al obtener detalles del torneo:", error);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedTournament(null);
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography
        variant="h4"
        gutterBottom
        color="primary"
        fontWeight="bold"
        mb={2}
        align="center"
      >
        Inscripciones
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
            <TableRow>
              <TableCell>
                <strong>Nombre</strong>
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
                <strong>Estado</strong>
              </TableCell>
              <TableCell>
                <strong>Inscripción</strong>
              </TableCell>
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
                <TableCell>{t.status}</TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => handleOpenModal(t._id)}
                  >
                    <HowToReg />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal */}
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle color="primary" fontWeight="bold">
          Detalles del Torneo
        </DialogTitle>
        <DialogContent dividers>
          {detailLoading ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              py={3}
            >
              <CircularProgress />
            </Box>
          ) : selectedTournament ? (
            <Box>
              <Typography>
                <strong>Nombre:</strong> {selectedTournament.name}
              </Typography>
              <Typography>
                <strong>Descripción:</strong> {selectedTournament.description}
              </Typography>
              <Typography>
                <strong>Deporte:</strong> {selectedTournament.sport?.name}
              </Typography>
              <Typography>
                <strong>Fecha de registro:</strong>{" "}
                {formatDate(selectedTournament.registrationStart)} -{" "}
                {formatDate(selectedTournament.registrationEnd)}
              </Typography>
              <Typography>
                <strong>Fecha del torneo:</strong>{" "}
                {formatDate(selectedTournament.startDate)} -{" "}
                {formatDate(selectedTournament.endDate)}
              </Typography>
              <Typography>
                <strong>Cantidad de equipos:</strong>{" "}
                {selectedTournament.maxTeams}
              </Typography>
              <Typography>
                <strong>Mínimo de jugadores por equipo:</strong>{" "}
                {selectedTournament.minPlayersPerTeam}
              </Typography>
              <Typography>
                <strong>Máximo de jugadores por equipo:</strong>{" "}
                {selectedTournament.maxPlayersPerTeam}
              </Typography>
              <Typography>
                <strong>Estado:</strong> {selectedTournament.status}
              </Typography>
            </Box>
          ) : (
            <Typography color="error">
              No se pudieron cargar los datos.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageTournaments;
