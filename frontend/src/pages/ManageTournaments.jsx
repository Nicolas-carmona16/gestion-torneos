import { Box, Typography, CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import {
  getAllTournaments,
  getTournamentById,
} from "../services/tournamentService";
import TournamentTable from "../components/TournamentTable";
import TournamentModal from "../components/TournamentModal";

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
        align="center"
      >
        Gestión de Torneos
      </Typography>

      <TournamentTable
        tournaments={tournaments}
        onViewDetails={handleOpenModal}
      />

      <TournamentModal
        open={modalOpen}
        loading={detailLoading}
        tournament={selectedTournament}
        onClose={handleCloseModal}
      />
    </Box>
  );
};

export default ManageTournaments;
