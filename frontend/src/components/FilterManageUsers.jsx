import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
} from "@mui/material";
import { roleMapping } from "../utils/roleUtils";

/**
 * @module FilterManageUsers
 * @component
 * @description Provides UI controls to filter the list of users by name/email and role.
 *
 * @param {Object} props - Component props.
 * @param {string} props.searchTerm - Current text in the search input.
 * @param {Function} props.setSearchTerm - Function to update the search term.
 * @param {string} props.roleFilter - Currently selected role filter.
 * @param {Function} props.setRoleFilter - Function to update the selected role.
 *
 * @returns {JSX.Element} A filter section with a text input and role dropdown.
 *
 * @example
 * <FilterManageUsers
 *   searchTerm={searchTerm}
 *   setSearchTerm={setSearchTerm}
 *   roleFilter={roleFilter}
 *   setRoleFilter={setRoleFilter}
 * />
 */
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
