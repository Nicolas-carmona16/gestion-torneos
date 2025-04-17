import React from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Box,
} from "@mui/material";
import FormTextField from "./FormTextFields";

const TournamentFormFields = ({
  sports,
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  handleSportChange,
}) => {
  return (
    <Box className="flex flex-col md:flex-row gap-6">
      <Box className="flex flex-col gap-4 w-full md:w-1/2">
        <FormTextField name="name" label="Nombre del Torneo" />
        <FormTextField
          name="description"
          label="Descripción"
          multiline
          rows={3}
        />
        <FormControl fullWidth error={Boolean(touched.sport && errors.sport)}>
          <InputLabel id="sport-label">Deporte</InputLabel>
          <Select
            labelId="sport-label"
            name="sport"
            value={values.sport}
            onChange={(e) => handleSportChange(e, handleChange)}
            onBlur={handleBlur}
          >
            {sports.map((sport) => (
              <MenuItem key={sport._id} value={sport._id}>
                {sport.name}
              </MenuItem>
            ))}
          </Select>
          {touched.sport && errors.sport && (
            <FormHelperText>{errors.sport}</FormHelperText>
          )}
        </FormControl>
        <FormTextField
          name="registrationStart"
          label="Inicio de Inscripción"
          type="date"
          InputLabelProps={{ shrink: true }}
        />
        <FormTextField
          name="registrationEnd"
          label="Fin de Inscripción"
          type="date"
          InputLabelProps={{ shrink: true }}
        />
        <FormTextField
          name="maxTeams"
          label="Máximo de Equipos"
          type="number"
        />
      </Box>

      <Box className="flex flex-col gap-4 w-full md:w-1/2">
        <FormControl fullWidth error={Boolean(touched.format && errors.format)}>
          <InputLabel id="format-label">Formato</InputLabel>
          <Select
            labelId="format-label"
            name="format"
            value={values.format}
            onChange={handleChange}
            onBlur={handleBlur}
          >
            <MenuItem value="group-stage">Fase de Grupos</MenuItem>
            <MenuItem value="elimination">Eliminación Directa</MenuItem>
          </Select>
          {touched.format && errors.format && (
            <FormHelperText>{errors.format}</FormHelperText>
          )}
        </FormControl>
        <FormTextField
          name="startDate"
          label="Inicio del Torneo"
          type="date"
          InputLabelProps={{ shrink: true }}
        />
        <FormTextField
          name="endDate"
          label="Fin del Torneo"
          type="date"
          InputLabelProps={{ shrink: true }}
        />
        <FormTextField
          name="minPlayersPerTeam"
          label="Mínimo de Jugadores por Equipo"
          type="number"
        />
        <FormTextField
          name="maxPlayersPerTeam"
          label="Máximo de Jugadores por Equipo"
          type="number"
        />
      </Box>
    </Box>
  );
};

export default TournamentFormFields;
