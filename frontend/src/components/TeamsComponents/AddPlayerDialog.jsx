import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  CircularProgress,
} from "@mui/material";
import { Formik, Form, Field } from "formik";
import { TextField } from "@mui/material";
import { validationNewPlayerSchema } from "../../utils/validationSchema";

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
          eps: "",
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

            await onSubmit(values);

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
