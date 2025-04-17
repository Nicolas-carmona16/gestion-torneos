import {
  Box,
  Typography,
  CircularProgress,
  TablePagination,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllTournaments,
  getTournamentById,
  deleteTournament,
} from "../services/tournamentService";
import { getAllSports } from "../services/sportService";
import { getUser } from "../services/authService";
import TournamentTable from "../components/TournamentTable";
import TournamentModal from "../components/TournamentModal";
import FilterTournaments from "../components/FilterTournaments";
import ConfirmDeleteDialog from "../components/ConfirmDeleteDialog";

const ITEMS_PER_PAGE = 10;

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
  const [page, setPage] = useState(0);
  const [registrationStart, setRegistrationStart] = useState("");
  const [registrationEnd, setRegistrationEnd] = useState("");
  const [user, setUser] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tournamentToDelete, setTournamentToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tournamentData, sportsData, userData] = await Promise.all([
          getAllTournaments(),
          getAllSports(),
          getUser(),
        ]);
        setTournaments(tournamentData);
        setFilteredTournaments(tournamentData);
        setSports(sportsData);
        setUser(userData);
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
      const matchesDate =
        (!registrationStart ||
          new Date(tournament.registrationStart) >=
            new Date(registrationStart)) &&
        (!registrationEnd ||
          new Date(tournament.registrationEnd) <= new Date(registrationEnd));

      return matchesName && matchesSport && matchesDate;
    });

    setFilteredTournaments(filtered);
    setPage(0);
  }, [
    searchTerm,
    selectedSport,
    registrationStart,
    registrationEnd,
    tournaments,
  ]);

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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleDeleteTournamentClick = (id) => {
    setTournamentToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDeleteTournament = async () => {
    setDeleting(true);
    try {
      await deleteTournament(tournamentToDelete);
      const updated = tournaments.filter((t) => t._id !== tournamentToDelete);
      setTournaments(updated);
      setFilteredTournaments(updated);
      setSnackbarOpen(true);
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error al eliminar torneo:", error);
    } finally {
      setDeleting(false);
      setTournamentToDelete(null);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
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
        <Box
          display="flex"
          justifyContent="center"
          flexGrow={1}
          marginLeft={20}
        >
          <Typography variant="h4" color="primary" fontWeight="bold">
            Inscripciones
          </Typography>
        </Box>

        {user?.role === "admin" && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/crear-torneo")}
          >
            Crear Torneo
          </Button>
        )}
      </Box>

      <FilterTournaments
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedSport={selectedSport}
        setSelectedSport={setSelectedSport}
        sports={sports}
        registrationStart={registrationStart}
        registrationEnd={registrationEnd}
        setRegistrationStart={setRegistrationStart}
        setRegistrationEnd={setRegistrationEnd}
      />

      {filteredTournaments.length === 0 ? (
        <Typography align="center" mt={4}>
          No se encontraron torneos con los criterios seleccionados.
        </Typography>
      ) : (
        <>
          <TournamentTable
            tournaments={paginatedTournaments}
            onViewDetails={handleOpenModal}
            onDeleteTournament={handleDeleteTournamentClick}
            user={user}
          />
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

      <TournamentModal
        open={modalOpen}
        loading={detailLoading}
        tournament={selectedTournament}
        onClose={handleCloseModal}
      />

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        handleClose={() => setDeleteDialogOpen(false)}
        handleConfirm={handleConfirmDeleteTournament}
        deleting={deleting}
        entityName="torneo"
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          sx={{ width: "100%" }}
        >
          Torneo eliminado exitosamente.
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ManageTournaments;
