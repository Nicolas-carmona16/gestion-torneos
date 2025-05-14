import { useState, useEffect, useCallback } from "react";
import { useFormik } from "formik";
import { validationTeamRegisterSchema } from "../../utils/validationSchema";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  IconButton,
  Divider,
  Paper,
  Alert,
  Stack,
  Tooltip,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { registerTeam } from "../../services/teamService";

const careerOptions = [
  "Bioingeniería",
  "Ingeniería Ambiental",
  "Ingeniería Civil",
  "Ingeniería Eléctrica",
  "Ingeniería Electrónica",
  "Ingeniería Industrial",
  "Ingeniería de Materiales",
  "Ingeniería Mecánica",
  "Ingeniería Química",
  "Ingeniería Sanitaria",
  "Ingeniería de Sistemas",
  "Ingeniería de Telecomunicaciones",
];

const TeamRegistrationForm = ({
  tournament,
  existingTeams,
  currentUser,
  isFull,
  onSuccess,
  onCancel,
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [userAlreadyRegistered, setUserAlreadyRegistered] = useState(false);
  const [playerErrors, setPlayerErrors] = useState({});
  const [captainEPSFile, setCaptainEPSFile] = useState(null);
  const [playersEPSFiles, setPlayersEPSFiles] = useState([]);

  const formik = useFormik({
    initialValues: {
      name: "",
      tournamentId: tournament._id,
      captainExtra: {
        idNumber: "",
        career: "",
      },
      players: Array(Math.max(tournament.minPlayersPerTeam - 1, 1))
        .fill()
        .map(() => ({
          fullName: "",
          idNumber: "",
          email: "",
          career: "",
        })),
    },
    validationSchema: validationTeamRegisterSchema,
    onSubmit: async (values) => {
      if (userAlreadyRegistered) {
        setError("Ya estás registrado en otro equipo de este torneo");
        return;
      }

      if (!captainEPSFile) {
        setError("Debes subir el documento EPS del capitán");
        return;
      }

      if (
        playersEPSFiles.length !== values.players.length ||
        playersEPSFiles.some((file) => !file)
      ) {
        setError("Debes subir documentos EPS para todos los jugadores");
        return;
      }

      if (
        captainEPSFile.type !== "application/pdf" ||
        playersEPSFiles.some((file) => file.type !== "application/pdf")
      ) {
        setError("Todos los documentos EPS deben ser archivos PDF");
        return;
      }

      let hasPlayerErrors = false;
      values.players.forEach((player, index) => {
        if (checkPlayerRegistered(player, index)) {
          hasPlayerErrors = true;
        }
      });

      if (hasPlayerErrors || Object.keys(playerErrors).length > 0) {
        setError("Uno o más jugadores ya están registrados en otro equipo");
        return;
      }

      setSubmitting(true);
      setError(null);

      try {
        const response = await registerTeam(values, {
          captainEPS: captainEPSFile,
          playersEPS: playersEPSFiles,
        });
        onSuccess(response.team._id);
      } catch (err) {
        const errorMsg =
          err.response?.data?.message ||
          err.message ||
          "Error al registrar el equipo";
        setError(errorMsg);
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (currentUser && existingTeams.length > 0) {
      const isRegistered = existingTeams.some((team) =>
        team.players.some((player) => player.email === currentUser.email)
      );
      setUserAlreadyRegistered(isRegistered);
    }
  }, [currentUser, existingTeams]);

  const checkPlayerRegistered = useCallback(
    (playerData, index) => {
      if (!playerData.idNumber && !playerData.email) return false;

      const isRegistered = existingTeams.some((team) =>
        team.players.some(
          (player) =>
            player.idNumber === playerData.idNumber ||
            player.email === playerData.email
        )
      );

      if (isRegistered) {
        setPlayerErrors((prev) => ({
          ...prev,
          [index]: "Este jugador ya está registrado en otro equipo del torneo",
        }));
      } else {
        setPlayerErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[index];
          return newErrors;
        });
      }

      return isRegistered;
    },
    [existingTeams]
  );

  const validatePlayers = useCallback(() => {
    formik.values.players.forEach((player, index) => {
      checkPlayerRegistered(player, index);
    });
  }, [formik.values.players, checkPlayerRegistered]);

  useEffect(() => {
    validatePlayers();
  }, [validatePlayers]);

  const handleCaptainEPSChange = (event) => {
    setCaptainEPSFile(event.target.files[0]);
  };

  const handlePlayerEPSChange = (index, event) => {
    const newFiles = [...playersEPSFiles];
    newFiles[index] = event.target.files[0];
    setPlayersEPSFiles(newFiles);
  };

  const addPlayer = () => {
    if (formik.values.players.length < tournament.maxPlayersPerTeam - 1) {
      formik.setFieldValue("players", [
        ...formik.values.players,
        { fullName: "", idNumber: "", email: "", career: "" },
      ]);
      setPlayersEPSFiles([...playersEPSFiles, null]);
    }
  };

  const removePlayer = (index) => {
    if (formik.values.players.length > tournament.minPlayersPerTeam - 1) {
      const updatedPlayers = [...formik.values.players];
      updatedPlayers.splice(index, 1);
      formik.setFieldValue("players", updatedPlayers);

      const updatedFiles = [...playersEPSFiles];
      updatedFiles.splice(index, 1);
      setPlayersEPSFiles(updatedFiles);

      setPlayerErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[index];
        return newErrors;
      });
    }
  };

  const handlePlayerFieldChange = (e, index) => {
    formik.handleChange(e);

    setTimeout(() => {
      const fieldName = e.target.name.split(".")[2];
      if (fieldName === "email" || fieldName === "idNumber") {
        checkPlayerRegistered(formik.values.players[index], index);
      }
    }, 500);
  };

  return (
    <Box component="form" onSubmit={formik.handleSubmit}>
      <Stack spacing={3}>
        <Box display="flex" alignItems="center">
          <IconButton onClick={onCancel} sx={{ mr: 1 }} color="primary">
            <ArrowBackIcon />
          </IconButton>
          <Box flexGrow={1} display="flex" justifyContent="center">
            <Typography variant="h4" color="primary" fontWeight="bold">
              Registro de Equipo
            </Typography>
          </Box>
        </Box>

        {userAlreadyRegistered && (
          <Alert severity="error" sx={{ mb: 2 }}>
            No puedes registrar un nuevo equipo porque ya estás registrado como
            jugador en otro equipo de este torneo.
          </Alert>
        )}

        <fieldset
          disabled={userAlreadyRegistered}
          style={{ border: "none", padding: 0 }}
        >
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom color="primary">
              Información del Equipo
            </Typography>
            <Grid columns={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Nombre del equipo"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
                required
              />
            </Grid>

            <Typography variant="h6" gutterBottom color="primary" mt={3}>
              Información del Capitán
            </Typography>
            <Grid container spacing={2}>
              <Grid columns={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Cédula"
                  name="captainExtra.idNumber"
                  value={formik.values.captainExtra.idNumber}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.captainExtra?.idNumber &&
                    Boolean(formik.errors.captainExtra?.idNumber)
                  }
                  helperText={
                    formik.touched.captainExtra?.idNumber &&
                    formik.errors.captainExtra?.idNumber
                  }
                  required
                />
              </Grid>
              <Grid columns={{ xs: 12, md: 6 }}>
                <input
                  accept="application/pdf"
                  style={{ display: "none" }}
                  id="captain-eps-upload"
                  type="file"
                  onChange={handleCaptainEPSChange}
                  required
                />
                <label htmlFor="captain-eps-upload">
                  <Button variant="outlined" component="span" fullWidth>
                    {captainEPSFile ? captainEPSFile.name : "Subir EPS (PDF)"}
                  </Button>
                </label>
                {captainEPSFile && (
                  <Typography variant="caption" color="textSecondary">
                    Archivo seleccionado: {captainEPSFile.name}
                  </Typography>
                )}
              </Grid>
              <Grid columns={{ xs: 12, md: 6 }}>
                <FormControl
                  fullWidth
                  sx={{ minWidth: 222 }}
                  error={
                    formik.touched.captainExtra?.career &&
                    Boolean(formik.errors.captainExtra?.career)
                  }
                >
                  <InputLabel id="captain-career-label">Carrera</InputLabel>
                  <Select
                    labelId="captain-career-label"
                    name="captainExtra.career"
                    value={formik.values.captainExtra.career}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    label="Carrera"
                    disabled={userAlreadyRegistered}
                  >
                    {careerOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.captainExtra?.career &&
                    formik.errors.captainExtra?.career && (
                      <FormHelperText error>
                        {formik.errors.captainExtra.career}
                      </FormHelperText>
                    )}
                </FormControl>
              </Grid>
            </Grid>

            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography variant="h6" color="primary" mt={3}>
                Jugadores: {formik.values.players.length + 1}/
                {tournament.maxPlayersPerTeam}
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={addPlayer}
                disabled={
                  formik.values.players.length >=
                  tournament.maxPlayersPerTeam - 1
                }
              >
                Agregar Jugador
              </Button>
            </Box>

            {formik.values.players.map((player, index) => (
              <Box key={index} mb={3}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={1}
                >
                  <Typography variant="subtitle1">
                    Jugador {index + 1}
                  </Typography>
                  {formik.values.players.length >
                    tournament.minPlayersPerTeam - 1 && (
                    <IconButton
                      color="error"
                      onClick={() => removePlayer(index)}
                    >
                      <RemoveIcon />
                    </IconButton>
                  )}
                </Box>
                <Divider sx={{ mb: 2 }} />

                {playerErrors[index] && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {playerErrors[index]}
                  </Alert>
                )}

                <Grid container spacing={2}>
                  <Grid columns={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      label="Nombre completo"
                      name={`players[${index}].fullName`}
                      value={player.fullName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={
                        formik.touched.players?.[index]?.fullName &&
                        Boolean(formik.errors.players?.[index]?.fullName)
                      }
                      helperText={
                        formik.touched.players?.[index]?.fullName &&
                        formik.errors.players?.[index]?.fullName
                      }
                      required
                    />
                  </Grid>
                  <Grid columns={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      label="Cédula"
                      name={`players[${index}].idNumber`}
                      value={player.idNumber}
                      onChange={(e) => handlePlayerFieldChange(e, index)}
                      onBlur={formik.handleBlur}
                      error={
                        (formik.touched.players?.[index]?.idNumber &&
                          Boolean(formik.errors.players?.[index]?.idNumber)) ||
                        Boolean(playerErrors[index])
                      }
                      helperText={
                        formik.touched.players?.[index]?.idNumber &&
                        formik.errors.players?.[index]?.idNumber
                      }
                      required
                    />
                  </Grid>
                  <Grid columns={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      label="Correo"
                      name={`players[${index}].email`}
                      type="email"
                      value={player.email}
                      onChange={(e) => handlePlayerFieldChange(e, index)}
                      onBlur={formik.handleBlur}
                      error={
                        (formik.touched.players?.[index]?.email &&
                          Boolean(formik.errors.players?.[index]?.email)) ||
                        Boolean(playerErrors[index])
                      }
                      helperText={
                        formik.touched.players?.[index]?.email &&
                        formik.errors.players?.[index]?.email
                      }
                      required
                    />
                  </Grid>
                  <Grid columns={{ xs: 12, md: 4 }}>
                    <input
                      accept="application/pdf"
                      style={{ display: "none" }}
                      id={`player-${index}-eps-upload`}
                      type="file"
                      onChange={(e) => handlePlayerEPSChange(index, e)}
                      required
                    />
                    <label htmlFor={`player-${index}-eps-upload`}>
                      <Button variant="outlined" component="span" fullWidth>
                        {playersEPSFiles[index]
                          ? playersEPSFiles[index].name
                          : "Subir EPS (PDF)"}
                      </Button>
                    </label>
                    {playersEPSFiles[index] && (
                      <Typography variant="caption" color="textSecondary">
                        Archivo seleccionado: {playersEPSFiles[index].name}
                      </Typography>
                    )}
                  </Grid>
                  <Grid sx={{ xs: 12, md: 4 }}>
                    <FormControl
                      fullWidth
                      sx={{ minWidth: 222 }}
                      error={
                        formik.touched.players?.[index]?.career &&
                        Boolean(formik.errors.players?.[index]?.career)
                      }
                    >
                      <InputLabel id={`player-${index}-career-label`}>
                        Carrera
                      </InputLabel>
                      <Select
                        labelId={`player-${index}-career-label`}
                        name={`players[${index}].career`}
                        value={formik.values.players[index].career}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        label="Carrera"
                        disabled={userAlreadyRegistered}
                      >
                        {careerOptions.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </Select>
                      {formik.touched.players?.[index]?.career &&
                        formik.errors.players?.[index]?.career && (
                          <FormHelperText error>
                            {formik.errors.players[index].career}
                          </FormHelperText>
                        )}
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>
            ))}
          </Paper>
        </fieldset>

        {error && <Alert severity="error">{error}</Alert>}

        <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
          <Button
            variant="outlined"
            size="large"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Tooltip
            title={
              <Typography sx={{ fontSize: "14px" }}>
                {isFull
                  ? "Este torneo ya ha alcanzado el número máximo de equipos permitidos"
                  : ""}
              </Typography>
            }
            arrow
            disableHoverListener={!isFull}
          >
            <span style={{ display: "inline-block" }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={
                  submitting ||
                  isFull ||
                  userAlreadyRegistered ||
                  Object.keys(playerErrors).length > 0
                }
                sx={{
                  "&:disabled": {
                    backgroundColor: isFull ? "rgba(0, 0, 0, 0.12)" : undefined,
                    color: isFull ? "rgba(0, 0, 0, 0.26)" : undefined,
                  },
                }}
              >
                {submitting ? "Registrando..." : "Registrar Equipo"}
              </Button>
            </span>
          </Tooltip>
        </Box>
      </Stack>
    </Box>
  );
};

export default TeamRegistrationForm;
