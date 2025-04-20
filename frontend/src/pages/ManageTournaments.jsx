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
  updateTournament,
} from "../services/tournamentService";
import { getAllSports } from "../services/sportService";
import { getUser } from "../services/authService";
import TournamentTable from "../components/TournamentTable";
import TournamentModal from "../components/TournamentModal";
import FilterTournaments from "../components/FilterTournaments";
import ConfirmDeleteDialog from "../components/ConfirmDeleteDialog";
import EditTournamentDialog from "../components/EditTournamentDialog";

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
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentTournament, setCurrentTournament] = useState(null);
  const [updatedData, setUpdatedData] = useState({
    name: "",
    description: "",
    sport: "",
    format: "",
    registrationStart: "",
    registrationEnd: "",
    startDate: "",
    endDate: "",
    maxTeams: "",
    minPlayersPerTeam: "",
    maxPlayersPerTeam: "",
    customRules: {},
  });

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

  const handleEditTournament = (tournament) => {
    setCurrentTournament(tournament);
    setUpdatedData({
      name: tournament.name,
      description: tournament.description,
      sport: tournament.sport?._id,
      format: tournament.format,
      registrationStart: tournament.registrationStart.split("T")[0],
      registrationEnd: tournament.registrationEnd.split("T")[0],
      startDate: tournament.startDate.split("T")[0],
      endDate: tournament.endDate.split("T")[0],
      maxTeams: tournament.maxTeams,
      minPlayersPerTeam: tournament.minPlayersPerTeam,
      maxPlayersPerTeam: tournament.maxPlayersPerTeam,
      customRules: tournament.customRules,
    });
    setEditModalOpen(true);
  };

  const handleUpdateTournament = async () => {
    try {
      await updateTournament(currentTournament._id, updatedData);
      setSnackbarMessage("Torneo actualizado exitosamente.");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);

      const calculateStatus = (tournamentData) => {
        const now = new Date();
        const regStart = new Date(tournamentData.registrationStart);
        const regEnd = new Date(tournamentData.registrationEnd);
        const start = new Date(tournamentData.startDate);
        const end = new Date(tournamentData.endDate);

        if (now < regStart) return "pending";
        if (now >= regStart && now < regEnd) return "registration";
        if (now >= regEnd && now < start) return "pending";
        if (now >= start && now < end) return "active";
        return "finished";
      };

      const selectedSport = sports.find(
        (sport) => sport._id === updatedData.sport
      );
      const updatedTournament = {
        ...currentTournament,
        ...updatedData,
        sport: selectedSport,
        status: calculateStatus(updatedData),
      };
      setTournaments((prev) =>
        prev.map((t) =>
          t._id === currentTournament._id ? updatedTournament : t
        )
      );
      setFilteredTournaments((prev) =>
        prev.map((t) =>
          t._id === currentTournament._id ? updatedTournament : t
        )
      );
      setEditModalOpen(false);
    } catch {
      setSnackbarMessage("Error al actualizar el torneo");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

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
      setSnackbarMessage("Torneo eliminado exitosamente.");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      setDeleteDialogOpen(false);
    } catch {
      setSnackbarMessage("Error al eliminar el torneo.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      setDeleteDialogOpen(false);
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
            handleEditTournament={handleEditTournament}
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

      <EditTournamentDialog
        open={editModalOpen}
        handleClose={() => setEditModalOpen(false)}
        updatedData={updatedData}
        setUpdatedData={setUpdatedData}
        handleUpdateTournament={handleUpdateTournament}
        sports={sports}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        message={snackbarMessage}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ManageTournaments;
