import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { Formik, Form, Field } from "formik";
import { TextField } from "@mui/material";
import { validationNewPlayerSchema } from "../../utils/validationSchema";

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

const AddPlayerDialog = ({
  open,
  onClose,
  onSubmit,
  tournament,
  selectedTeam,
  currentUser,
  showSnackbar,
  isPlayerRegisteredInTournament,
}) => {
  const [epsFile, setEpsFile] = useState(null);

  const handleFileChange = (event) => {
    setEpsFile(event.target.files[0]);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      disableRestoreFocus
    >
      <Formik
        initialValues={{
          fullName: "",
          idNumber: "",
          email: "",
          career: "",
        }}
        validationSchema={validationNewPlayerSchema}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            if (isPlayerRegisteredInTournament(values.idNumber, values.email)) {
              showSnackbar(
                `Jugador ${values.fullName} ya está registrado en este torneo`,
                "error"
              );
              return;
            }

            if (selectedTeam.players?.length >= tournament.maxPlayersPerTeam) {
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

            if (!epsFile) {
              showSnackbar("Debes subir el documento EPS del jugador", "error");
              return;
            }

            if (epsFile.type !== "application/pdf") {
              showSnackbar("El documento EPS debe ser un archivo PDF", "error");
              return;
            }

            await onSubmit(values, epsFile);

            showSnackbar("Jugador agregado correctamente");
            onClose();
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
        {({
          isSubmitting,
          errors,
          touched,
          values,
          handleChange,
          handleBlur,
        }) => (
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
                <Grid sx={{ xs: 12 }}>
                  <input
                    accept="application/pdf"
                    style={{ display: "none" }}
                    id="eps-upload"
                    type="file"
                    onChange={handleFileChange}
                  />
                  <label htmlFor="eps-upload">
                    <Button variant="outlined" component="span" fullWidth>
                      {epsFile ? epsFile.name : "Subir EPS (PDF)"}
                    </Button>
                  </label>
                  {epsFile && (
                    <Typography variant="caption" color="textSecondary">
                      Archivo seleccionado: {epsFile.name}
                    </Typography>
                  )}
                </Grid>
                <Grid sx={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth sx={{ minWidth: 222 }}>
                    <InputLabel id="career-label">Carrera</InputLabel>
                    <Select
                      labelId="career-label"
                      name="career"
                      value={values.career}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      label="Carrera"
                      error={touched.career && Boolean(errors.career)}
                    >
                      {careerOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                    {touched.career && errors.career && (
                      <FormHelperText error>{errors.career}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={onClose}>Cancelar</Button>
              <Button type="submit" color="primary" disabled={isSubmitting}>
                {isSubmitting ? <CircularProgress size={24} /> : "Agregar"}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default AddPlayerDialog;
