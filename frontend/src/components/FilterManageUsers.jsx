import React from "react";
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
} from "@mui/material";
import { roleMapping } from "../utils/roleUtils";

const FilterManageUsers = ({
  searchTerm,
  setSearchTerm,
  roleFilter,
  setRoleFilter,
}) => {
  return (
    <Box mb={3} display="flex" justifyContent="center" gap={2}>
      <TextField
        label="Buscar por nombre o correo"
        variant="outlined"
        fullWidth
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <FormControl fullWidth>
        <InputLabel>Filtrar por rol</InputLabel>
        <Select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          label="Filtrar por rol"
        >
          <MenuItem value="">Todos</MenuItem>
          {Object.entries(roleMapping).map(([role, label]) => (
            <MenuItem key={role} value={role}>
              {label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default FilterManageUsers;
