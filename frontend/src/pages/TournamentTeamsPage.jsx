import {
  Box,
  Typography,
  CircularProgress,
  Button,
  Card,
  CardContent,
  Grid,
  Avatar,
  Divider,
  Chip,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Tooltip,
  Snackbar,
  Alert,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getTeamsByTournament,
  getTeamById,
  removePlayerFromTeam,
  addPlayersToTeam,
} from "../services/teamService";
import { getTournamentById } from "../services/tournamentService";
import { getUser } from "../services/authService";
import {
  Groups,
  Person,
  People,
  CalendarToday,
  Close,
} from "@mui/icons-material";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ConfirmDeleteDialog from "../components/ConfirmDeleteDialog";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const playerValidationSchema = Yup.object().shape({
  fullName: Yup.string().required("El nombre completo es obligatorio"),
  idNumber: Yup.string()
    .required("La cédula es obligatoria")
    .matches(/^\d+$/, "La cédula solo debe contener números"),
  email: Yup.string()
    .required("El correo es obligatorio")
    .matches(
      /^[a-zA-Z0-9._-]+@udea\.edu\.co$/,
      "Debe ser un correo institucional"
    ),
  eps: Yup.string().required("La EPS es obligatoria"),
});

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
        `El periodo para modificar jugadores finalizó el ${new Date(
          selectedTeam.tournament.registrationPlayerEnd
        ).toLocaleDateString()}`,
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
    const currentDate = new Date();
    const registrationEnd = new Date(tournament.registrationPlayerEnd);
    return currentDate <= registrationEnd;
  };

  const handleOpenDeleteDialog = (playerId) => {
    if (!canModifyPlayers(selectedTeam)) {
      showSnackbar(
        `El periodo para modificar jugadores finalizó el ${new Date(
          selectedTeam.tournament.registrationPlayerEnd
        ).toLocaleDateString()}`,
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
      <Box
        display="flex"
        justifyContent="flex-start"
        alignItems="center"
        mb={3}
      >
        <IconButton onClick={() => navigate("/equipos")} color="primary">
          <ArrowBackIcon />
        </IconButton>
        <Box ml={2}>
          {" "}
          <Typography variant="h4" gutterBottom color="primary">
            {tournament.name}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Equipos registrados: {teams.length}
          </Typography>
        </Box>
      </Box>

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
              <Card
                elevation={3}
                sx={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Avatar sx={{ bgcolor: "primary.main", mr: 2 }}>
                      <Groups />
                    </Avatar>
                    <Typography variant="h6" component="div">
                      {team.name}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box mb={2}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      <Person sx={{ verticalAlign: "middle", mr: 1 }} />
                      Capitán
                    </Typography>
                    <Typography variant="body1">
                      {team.captain?.firstName} {team.captain?.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {team.captain?.email}
                    </Typography>
                  </Box>

                  <Box mb={2}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      <People sx={{ verticalAlign: "middle", mr: 1 }} />
                      Jugadores
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      <Chip
                        label={`${team.players?.length || 0} jugadores`}
                        color="primary"
                        size="small"
                      />
                    </Box>
                  </Box>

                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      <CalendarToday sx={{ verticalAlign: "middle", mr: 1 }} />
                      Fecha de registro
                    </Typography>
                    <Typography>
                      {new Date(team.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </CardContent>

                <Box sx={{ p: 2, bgcolor: "background.default" }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => handleOpenModal(team)}
                  >
                    Ver detalles
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
        scroll="paper"
        disableRestoreFocus
      >
        <DialogTitle>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">
              <Groups sx={{ verticalAlign: "middle", mr: 1 }} />
              {selectedTeam?.name}
            </Typography>
            <IconButton onClick={handleCloseModal}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          {selectedTeam && (
            <Box>
              <Box mb={3}>
                <Typography variant="subtitle1" gutterBottom color="primary">
                  Información del equipo
                </Typography>
                <Grid container spacing={2}>
                  <Grid sx={{ xs: 12, sm: 6 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Capitán
                    </Typography>
                    <Typography variant="body1">
                      {selectedTeam.captain?.firstName}{" "}
                      {selectedTeam.captain?.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedTeam.captain?.email}
                    </Typography>
                  </Grid>
                  <Grid sx={{ xs: 12, sm: 6 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Fecha de registro
                    </Typography>
                    <Typography variant="body1">
                      {new Date(selectedTeam.createdAt).toLocaleDateString()}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="subtitle1" gutterBottom color="primary">
                    Jugadores ({selectedTeam.players?.length || 0})
                  </Typography>
                  {(currentUser?.role === "admin" ||
                    currentUser?._id === selectedTeam?.captain?._id) && (
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<AddIcon />}
                      onClick={handleOpenAddPlayerDialog}
                      disabled={!canModifyPlayers(selectedTeam)}
                    >
                      Agregar
                    </Button>
                  )}
                </Box>

                {selectedTeam.players?.length > 0 ? (
                  <List dense sx={{ maxHeight: "300px", overflow: "auto" }}>
                    {selectedTeam.players.map((player, index) => (
                      <ListItem
                        key={player._id || index}
                        secondaryAction={
                          (currentUser?._id === selectedTeam.captain?._id ||
                            currentUser?.role === "admin") && (
                            <Tooltip
                              title={
                                canModifyPlayers(selectedTeam)
                                  ? "Eliminar jugador"
                                  : `El periodo para modificar jugadores finalizó el ${new Date(
                                      selectedTeam.tournament.registrationPlayerEnd
                                    ).toLocaleDateString()}`
                              }
                            >
                              <span>
                                <IconButton
                                  edge="end"
                                  color={
                                    canModifyPlayers(selectedTeam)
                                      ? "error"
                                      : "default"
                                  }
                                  onClick={() =>
                                    canModifyPlayers(selectedTeam) &&
                                    handleOpenDeleteDialog(player._id)
                                  }
                                  disabled={!canModifyPlayers(selectedTeam)}
                                >
                                  <Close fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          )
                        }
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: "primary.main" }}>
                            <Person />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={`${player.fullName}`}
                          secondary={
                            <>
                              <Typography
                                component="span"
                                variant="body2"
                                color="text.secondary"
                              >
                                Correo: {player.email}
                              </Typography>
                              {currentUser?.role === "admin" && (
                                <>
                                  <Typography
                                    component="span"
                                    variant="body2"
                                    color="text.secondary"
                                    display="block"
                                  >
                                    Cédula: {player.idNumber}
                                  </Typography>
                                  <Typography
                                    component="span"
                                    variant="body2"
                                    color="text.secondary"
                                    display="block"
                                  >
                                    EPS: {player.eps}
                                  </Typography>
                                </>
                              )}
                            </>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No hay jugadores registrados en este equipo
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseModal} color="primary">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openAddPlayerDialog}
        onClose={handleCloseAddPlayerDialog}
        maxWidth="sm"
        fullWidth
        disableRestoreFocus
      >
        <Formik
          initialValues={{
            fullName: "",
            idNumber: "",
            email: "",
            eps: "",
          }}
          validationSchema={playerValidationSchema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              if (
                isPlayerRegisteredInTournament(values.idNumber, values.email)
              ) {
                showSnackbar(
                  `Jugador ${values.fullName} ya está registrado en este torneo`,
                  "error"
                );
                return;
              }

              if (
                selectedTeam.players?.length >= tournament.maxPlayersPerTeam
              ) {
                showSnackbar(
                  "El equipo ya tiene el máximo de jugadores permitidos",
                  "error"
                );
                return;
              }

              const isCaptain = currentUser?._id === selectedTeam.captain?._id;
              const isAdmin = currentUser?.role === "admin";

              if (!isCaptain && !isAdmin) {
                showSnackbar(
                  "No tienes permisos para agregar jugadores",
                  "error"
                );
                return;
              }

              await addPlayersToTeam(selectedTeam._id, [values]);

              const updatedTeam = await getTeamById(selectedTeam._id);
              setSelectedTeam(updatedTeam.team);
              const updatedTeamsData = await getTeamsByTournament(tournamentId);
              setTeams(updatedTeamsData.teams);

              showSnackbar("Jugador agregado correctamente");
              handleCloseAddPlayerDialog();
            } catch (error) {
              console.error("Error al agregar jugador:", error);
              showSnackbar(
                error.response?.data?.message || "Error al agregar jugador",
                "error"
              );
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting, errors, touched }) => (
            <Form>
              <DialogTitle>Agregar nuevo jugador</DialogTitle>
              <DialogContent dividers>
                <Grid container spacing={2}>
                  <Grid sx={{ xs: 12 }}>
                    <Field
                      as={TextField}
                      fullWidth
                      label="Nombre completo"
                      name="fullName"
                      error={touched.fullName && Boolean(errors.fullName)}
                      helperText={touched.fullName && errors.fullName}
                    />
                  </Grid>
                  <Grid sx={{ xs: 12, sm: 6 }}>
                    <Field
                      as={TextField}
                      fullWidth
                      label="Cédula"
                      name="idNumber"
                      error={touched.idNumber && Boolean(errors.idNumber)}
                      helperText={touched.idNumber && errors.idNumber}
                    />
                  </Grid>
                  <Grid sx={{ xs: 12 }}>
                    <Field
                      as={TextField}
                      fullWidth
                      label="Correo"
                      name="email"
                      type="email"
                      error={touched.email && Boolean(errors.email)}
                      helperText={touched.email && errors.email}
                    />
                  </Grid>
                  <Grid sx={{ xs: 12, sm: 6 }}>
                    <Field
                      as={TextField}
                      fullWidth
                      label="EPS"
                      name="eps"
                      error={touched.eps && Boolean(errors.eps)}
                      helperText={touched.eps && errors.eps}
                    />
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseAddPlayerDialog}>Cancelar</Button>
                <Button type="submit" color="primary" disabled={isSubmitting}>
                  {isSubmitting ? <CircularProgress size={24} /> : "Agregar"}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>

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
