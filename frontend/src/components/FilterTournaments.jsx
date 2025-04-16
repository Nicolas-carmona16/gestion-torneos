import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
} from "@mui/material";

const FilterTournaments = ({
  searchTerm,
  setSearchTerm,
  selectedSport,
  setSelectedSport,
  sports,
}) => {
  return (
    <Box
      mb={3}
      display="flex"
      gap={2}
      flexDirection={{ xs: "column", sm: "row" }}
      justifyContent="center"
    >
      <TextField
        label="Buscar por nombre"
        variant="outlined"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        fullWidth
      />

      <FormControl fullWidth>
        <InputLabel>Filtrar por deporte</InputLabel>
        <Select
          value={selectedSport}
          onChange={(e) => setSelectedSport(e.target.value)}
          label="Filtrar por rol"
        >
          <MenuItem value="">Todos</MenuItem>
          {sports.map((sport) => (
            <MenuItem key={sport._id} value={sport.name}>
              {sport.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default FilterTournaments;
