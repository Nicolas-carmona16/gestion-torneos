import { Box, Typography, CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import {
  getAllTournaments,
  getTournamentById,
} from "../services/tournamentService";
import { getAllSports } from "../services/sportService";
import TournamentTable from "../components/TournamentTable";
import TournamentModal from "../components/TournamentModal";
import FilterTournaments from "../components/FilterTournaments";

const ManageTournaments = () => {
  const [tournaments, setTournaments] = useState([]);
  const [filteredTournaments, setFilteredTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sports, setSports] = useState([]);
  const [selectedSport, setSelectedSport] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tournamentData, sportsData] = await Promise.all([
          getAllTournaments(),
          getAllSports(),
        ]);
        setTournaments(tournamentData);
        setFilteredTournaments(tournamentData);
        setSports(sportsData);
      } catch (error) {
        console.error("Error al cargar torneos o deportes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const filtered = tournaments.filter((tournament) => {
      const matchesName = tournament.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesSport = selectedSport
        ? tournament.sport?.name === selectedSport
        : true;
      return matchesName && matchesSport;
    });
    setFilteredTournaments(filtered);
  }, [searchTerm, selectedSport, tournaments]);

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

      <FilterTournaments
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedSport={selectedSport}
        setSelectedSport={setSelectedSport}
        sports={sports}
      />

      <TournamentTable
        tournaments={filteredTournaments}
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
