import { useState } from "react";
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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { registerTeam } from "../../services/teamService";

const TeamRegistrationForm = ({ tournament, isFull, onSuccess, onCancel }) => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const formik = useFormik({
    initialValues: {
      name: "",
      tournamentId: tournament._id,
      captainExtra: {
        idNumber: "",
        eps: "",
      },
      players: Array(Math.max(tournament.minPlayersPerTeam - 1, 1))
        .fill()
        .map(() => ({
          fullName: "",
          idNumber: "",
          email: "",
          eps: "",
        })),
    },
    validationSchema: validationTeamRegisterSchema,
    onSubmit: async (values) => {
      setSubmitting(true);
      setError(null);

      try {
        const response = await registerTeam(values);
        onSuccess(response.team._id);
      } catch (err) {
        setError(err.response?.data?.message || "Error al registrar el equipo");
      } finally {
        setSubmitting(false);
      }
    },
  });

  const addPlayer = () => {
    if (formik.values.players.length < tournament.maxPlayersPerTeam - 1) {
      formik.setFieldValue("players", [
        ...formik.values.players,
        { fullName: "", idNumber: "", email: "", eps: "" },
      ]);
    }
  };

  const removePlayer = (index) => {
    if (formik.values.players.length > tournament.minPlayersPerTeam - 1) {
      const updatedPlayers = [...formik.values.players];
      updatedPlayers.splice(index, 1);
      formik.setFieldValue("players", updatedPlayers);
    }
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
              <TextField
                fullWidth
                label="EPS"
                name="captainExtra.eps"
                value={formik.values.captainExtra.eps}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.captainExtra?.eps &&
                  Boolean(formik.errors.captainExtra?.eps)
                }
                helperText={
                  formik.touched.captainExtra?.eps &&
                  formik.errors.captainExtra?.eps
                }
                required
              />
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
                formik.values.players.length >= tournament.maxPlayersPerTeam - 1
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
                <Typography variant="subtitle1">Jugador {index + 1}</Typography>
                {formik.values.players.length >
                  tournament.minPlayersPerTeam - 1 && (
                  <IconButton color="error" onClick={() => removePlayer(index)}>
                    <RemoveIcon />
                  </IconButton>
                )}
              </Box>
              <Divider sx={{ mb: 2 }} />
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
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.players?.[index]?.idNumber &&
                      Boolean(formik.errors.players?.[index]?.idNumber)
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
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.players?.[index]?.email &&
                      Boolean(formik.errors.players?.[index]?.email)
                    }
                    helperText={
                      formik.touched.players?.[index]?.email &&
                      formik.errors.players?.[index]?.email
                    }
                    required
                  />
                </Grid>
                <Grid columns={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    label="EPS"
                    name={`players[${index}].eps`}
                    value={player.eps}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.players?.[index]?.eps &&
                      Boolean(formik.errors.players?.[index]?.eps)
                    }
                    helperText={
                      formik.touched.players?.[index]?.eps &&
                      formik.errors.players?.[index]?.eps
                    }
                    required
                  />
                </Grid>
              </Grid>
            </Box>
          ))}
        </Paper>

        {error && <Alert severity="error">{error}</Alert>}

        <Box display="flex" justifyContent="flex-end" gap={2}>
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
            <span>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={submitting || isFull}
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
