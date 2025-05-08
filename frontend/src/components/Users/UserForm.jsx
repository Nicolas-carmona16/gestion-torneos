import { Formik, Form } from "formik";
import {
  Button,
  Alert,
  Box,
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Typography,
  Autocomplete,
} from "@mui/material";
import { roleMapping } from "../../utils/roleUtils";
import { validationUserSchema } from "../../utils/validationSchema";

const UserForm = ({ sports, tournaments, onSubmit }) => {
  const roles = Object.entries(roleMapping).map(([value, label]) => ({
    value,
    label,
  }));

  return (
    <Formik
      initialValues={{
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: "captain",
        sports: [],
        tournaments: [],
      }}
      validationSchema={validationUserSchema}
      onSubmit={(values, actions) => {
        onSubmit(values, actions);
      }}
    >
      {({
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        isSubmitting,
        setFieldValue,
      }) => (
        <Form style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {errors.form && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errors.form}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Nombre"
            name="firstName"
            value={values.firstName}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.firstName && Boolean(errors.firstName)}
            helperText={touched.firstName && errors.firstName}
          />

          <TextField
            fullWidth
            label="Apellido"
            name="lastName"
            value={values.lastName}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.lastName && Boolean(errors.lastName)}
            helperText={touched.lastName && errors.lastName}
          />

          <TextField
            fullWidth
            label="Correo electrónico"
            name="email"
            type="email"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.email && Boolean(errors.email)}
            helperText={touched.email && errors.email}
          />

          <TextField
            fullWidth
            label="Contraseña"
            name="password"
            type="password"
            value={values.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.password && Boolean(errors.password)}
            helperText={touched.password && errors.password}
          />

          <FormControl fullWidth>
            <InputLabel>Rol</InputLabel>
            <Select
              name="role"
              value={values.role}
              label="Rol"
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.role && Boolean(errors.role)}
            >
              {roles.map((role) => (
                <MenuItem key={role.value} value={role.value}>
                  {role.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography variant="subtitle2">Deportes</Typography>
          <Autocomplete
            multiple
            options={sports}
            getOptionLabel={(option) => option.name}
            value={sports.filter((sport) => values.sports.includes(sport._id))}
            onChange={(_, newValue) => {
              const newSportsIds = newValue.map((sport) => sport._id);
              setFieldValue("sports", newSportsIds);
              setFieldValue(
                "tournaments",
                values.tournaments.filter((tournamentId) => {
                  const tournament = tournaments.find(
                    (t) => t._id === tournamentId
                  );
                  return newSportsIds.includes(tournament?.sport?._id);
                })
              );
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Selecciona deportes"
                error={touched.sports && Boolean(errors.sports)}
                helperText={touched.sports && errors.sports}
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  {...getTagProps({ index })}
                  key={option._id}
                  label={option.name}
                />
              ))
            }
          />

          <Typography variant="subtitle2">Torneos</Typography>
          <Autocomplete
            multiple
            options={tournaments.filter((tournament) =>
              values.sports.includes(tournament.sport?._id)
            )}
            getOptionLabel={(option) => option.name}
            value={tournaments.filter((tournament) =>
              values.tournaments.includes(tournament._id)
            )}
            onChange={(_, newValue) => {
              setFieldValue(
                "tournaments",
                newValue.map((tournament) => tournament._id)
              );
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Selecciona torneos"
                disabled={values.sports.length === 0}
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  {...getTagProps({ index })}
                  key={option._id}
                  label={option.name}
                />
              ))
            }
            disabled={values.sports.length === 0}
          />

          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              sx={{
                bgcolor: "#026937",
                "&:hover": { bgcolor: "#35944b" },
                fontSize: "1rem",
                px: 4,
                py: 1.5,
                minWidth: 200,
              }}
            >
              {isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Crear Usuario"
              )}
            </Button>
          </Box>
        </Form>
      )}
    </Formik>
  );
};

export default UserForm;
