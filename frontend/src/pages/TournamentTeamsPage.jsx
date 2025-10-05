import {
  Box,
  Typography,
  CircularProgress,
  Grid,
  Paper,
  Snackbar,
  Alert,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getTeamsByTournament,
  getTeamById,
  removePlayerFromTeam,
  addPlayersToTeam,
  updateTeamName,
} from "../services/teamService";
import { getTournamentById } from "../services/tournamentService";
import { getUser } from "../services/authService";
import { canModifyPlayers as canModifyPlayersUtil } from "../utils/dateHelpers";
import { formatDate } from "../utils/formatDate";
import ConfirmDeleteDialog from "../components/ConfirmDeleteDialog";
import TeamCard from "../components/TeamsComponents/TeamCard";
import TeamDetailsModal from "../components/TeamsComponents/TeamDetailModal";
import AddPlayerDialog from "../components/TeamsComponents/AddPlayerDialog";
import EditTeamNameDialog from "../components/TeamsComponents/EditTeamNameDialog";
import TournamentHeader from "../components/TeamsComponents/TournamentHeader";

const TournamentTeamsPage = () => {
  const { tournamentId } = useParams();
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tournament, setTournament] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [openAddPlayerDialog, setOpenAddPlayerDialog] = useState(false);
  const [openEditNameDialog, setOpenEditNameDialog] = useState(false);
  const [teamToEdit, setTeamToEdit] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teamsData, tournamentData] = await Promise.all([
          getTeamsByTournament(tournamentId),
          getTournamentById(tournamentId),
        ]);
        setTeams(teamsData.teams);
        setTournament(tournamentData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [tournamentId]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getUser();
        setCurrentUser(user);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();
  }, []);

  const handleOpenAddPlayerDialog = () => {
    if (!canModifyPlayers(selectedTeam)) {
      showSnackbar(
        `El periodo para modificar jugadores finalizó el ${formatDate(
          selectedTeam.tournament.registrationPlayerEnd
        )}`,
        "error"
      );
      return;
    }
    setOpenAddPlayerDialog(true);
  };

  const handleCloseAddPlayerDialog = () => {
    setOpenAddPlayerDialog(false);
  };

  const canModifyPlayers = (team) => {
    if (!team?.tournament) return false;
    return canModifyPlayersUtil(tournament);
  };

  const handleOpenDeleteDialog = (playerId) => {
    if (!canModifyPlayers(selectedTeam)) {
      showSnackbar(
        `El periodo para modificar jugadores finalizó el ${formatDate(
          selectedTeam.tournament.registrationPlayerEnd
        )}`,
        "error"
      );
      return;
    }
    setSelectedPlayer(playerId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedTeam || !selectedPlayer) return;

    try {
      if (selectedTeam.players?.length <= tournament.minPlayersPerTeam) {
        showSnackbar(
          `El equipo debe tener al menos ${tournament.minPlayersPerTeam} jugadores`,
          "error"
        );
        return;
      }

      setDeleting(true);
      const isCaptain = currentUser?._id === selectedTeam.captain?._id;
      const isAdmin = currentUser?.role === "admin";

      if (!isCaptain && !isAdmin) {
        showSnackbar("No tienes permisos para eliminar jugadores", "error");
        return;
      }

      await removePlayerFromTeam(selectedTeam._id, selectedPlayer);

      const updatedTeam = await getTeamById(selectedTeam._id);
      setSelectedTeam(updatedTeam.team);
      const updatedTeamsData = await getTeamsByTournament(tournamentId);
      setTeams(updatedTeamsData.teams);

      showSnackbar("Jugador eliminado correctamente");
    } catch (error) {
      console.error("Error al eliminar jugador:", error);
      showSnackbar(
        error.response?.data?.message || "Error al eliminar jugador",
        "error"
      );
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setSelectedPlayer(null);
    }
  };

  const handleOpenModal = async (team) => {
    try {
      setLoading(true);
      const response = await getTeamById(team._id);
      setSelectedTeam(response.team);
      setOpenModal(true);
    } catch (error) {
      console.error("Error al cargar los detalles del equipo:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedTeam(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const isPlayerRegisteredInTournament = (playerIdNumber, playerEmail) => {
    return teams.some((team) =>
      team.players.some(
        (player) =>
          player.idNumber === playerIdNumber || player.email === playerEmail
      )
    );
  };

  const handleEditTeamName = (team) => {
    setTeamToEdit(team);
    setOpenEditNameDialog(true);
  };

  const handleUpdateTeamName = async (teamId, newName) => {
    try {
      await updateTeamName(teamId, newName);

      setTeams((prevTeams) =>
        prevTeams.map((team) =>
          team._id === teamId ? { ...team, name: newName } : team
        )
      );

      if (selectedTeam && selectedTeam._id === teamId) {
        setSelectedTeam((prev) => ({ ...prev, name: newName }));
      }

      showSnackbar("Nombre del equipo actualizado correctamente");
    } catch (error) {
      console.error("Error al actualizar el nombre del equipo:", error);
      showSnackbar(
        error.response?.data?.message ||
          "Error al actualizar el nombre del equipo",
        "error"
      );
      throw error;
    }
  };

  const handleCloseEditNameDialog = () => {
    setOpenEditNameDialog(false);
    setTeamToEdit(null);
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

  if (!tournament) {
    return (
      <Box p={3}>
        <Typography variant="h6">Torneo no encontrado</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <TournamentHeader
        tournament={tournament}
        teamsCount={teams.length}
        onBack={() => navigate("/equipos")}
      />

      {teams.length === 0 ? (
        <Paper elevation={3} sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary">
            No hay equipos registrados en este torneo
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {teams.map((team) => (
            <Grid
              key={team._id}
              sx={{
                width: { xs: "100%", sm: "350px", md: "350px" },
                maxWidth: "100%",
                flex: "0 0 auto",
              }}
            >
              <TeamCard
                team={team}
                onClick={() => handleOpenModal(team)}
                currentUser={currentUser}
                onEditName={handleEditTeamName}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <TeamDetailsModal
        open={openModal}
        onClose={handleCloseModal}
        team={selectedTeam}
        currentUser={currentUser}
        onAddPlayer={handleOpenAddPlayerDialog}
        canModify={canModifyPlayers(selectedTeam)}
        onDeletePlayer={handleOpenDeleteDialog}
      />

      <AddPlayerDialog
        open={openAddPlayerDialog}
        onClose={handleCloseAddPlayerDialog}
        onSubmit={async (values, epsFile) => {
          try {
            await addPlayersToTeam(selectedTeam._id, values, epsFile);
            const updatedTeam = await getTeamById(selectedTeam._id);
            setSelectedTeam(updatedTeam.team);
            const updatedTeamsData = await getTeamsByTournament(tournamentId);
            setTeams(updatedTeamsData.teams);
            showSnackbar("Jugador agregado exitosamente", "success");
          } catch (error) {
            showSnackbar(
              error.response?.data?.message || "Error al agregar jugador",
              "error"
            );
          }
        }}
        tournament={tournament}
        selectedTeam={selectedTeam}
        currentUser={currentUser}
        showSnackbar={showSnackbar}
        isPlayerRegisteredInTournament={isPlayerRegisteredInTournament}
      />

      <EditTeamNameDialog
        open={openEditNameDialog}
        onClose={handleCloseEditNameDialog}
        team={teamToEdit}
        onUpdate={handleUpdateTeamName}
      />

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        handleClose={() => setDeleteDialogOpen(false)}
        handleConfirm={handleConfirmDelete}
        deleting={deleting}
        entityName="jugador"
        confirmButtonColor="error"
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TournamentTeamsPage;
