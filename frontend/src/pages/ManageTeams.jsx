import {
  Box,
  Typography,
  CircularProgress,
  TablePagination,
} from "@mui/material";
import { useEffect, useState } from "react";
import { getAllTournaments } from "../services/tournamentService";
import { getAllSports } from "../services/sportService";
import { getUser } from "../services/authService";
import FilterTournaments from "../components/FilterTournaments";
import TournamentTableTeam from "../components/TournamentTableTeam";

const ITEMS_PER_PAGE = 10;

const ManageTeams = () => {
  const [tournaments, setTournaments] = useState([]);
  const [filteredTournaments, setFilteredTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sports, setSports] = useState([]);
  const [selectedSport, setSelectedSport] = useState("");
  const [page, setPage] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tournamentData, sportsData] = await Promise.all([
          getAllTournaments(),
          getAllSports(),
          getUser(),
        ]);
        setTournaments(tournamentData);
        setFilteredTournaments(tournamentData);
        setSports(sportsData);
      } catch (error) {
        console.error("Error al cargar datos:", error);
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
    setPage(0);
  }, [searchTerm, selectedSport, tournaments]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
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

  const paginatedTournaments = filteredTournaments.slice(
    page * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE + ITEMS_PER_PAGE
  );

  return (
    <Box p={3}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Box display="flex" justifyContent="center" flexGrow={1} marginLeft={0}>
          <Typography variant="h4" color="primary" fontWeight="bold">
            Equipos
          </Typography>
        </Box>
      </Box>

      <FilterTournaments
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedSport={selectedSport}
        setSelectedSport={setSelectedSport}
        sports={sports}
      />

      {filteredTournaments.length === 0 ? (
        <Typography align="center" mt={4}>
          No se encontraron torneos con los criterios seleccionados.
        </Typography>
      ) : (
        <>
          <TournamentTableTeam tournaments={paginatedTournaments} />
          <TablePagination
            rowsPerPageOptions={[ITEMS_PER_PAGE]}
            component="div"
            count={filteredTournaments.length}
            rowsPerPage={ITEMS_PER_PAGE}
            page={page}
            onPageChange={handleChangePage}
          />
        </>
      )}
    </Box>
  );
};

export default ManageTeams;
