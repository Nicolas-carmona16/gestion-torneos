import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Button,
} from "@mui/material";

const FilterTournaments = ({
  searchTerm,
  setSearchTerm,
  selectedSport,
  setSelectedSport,
  sports,
  registrationStart,
  registrationTeamEnd,
  setRegistrationStart,
  setRegistrationTeamEnd,
}) => {
  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedSport("");
    setRegistrationStart("");
    setRegistrationTeamEnd("");
  };

  return (
    <Box mb={3} display="flex" flexDirection="column" gap={2}>
      <Box display="flex" gap={2} flexWrap="wrap">
        <TextField
          label="Buscar por nombre"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
          sx={{ flex: 1 }}
        />
        <FormControl fullWidth sx={{ flex: 1 }}>
          <InputLabel>Filtrar por deporte</InputLabel>
          <Select
            value={selectedSport}
            onChange={(e) => setSelectedSport(e.target.value)}
            label="Filtrar por deporte"
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
      <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
        <TextField
          label="Fecha inicio registro"
          type="date"
          value={registrationStart}
          onChange={(e) => setRegistrationStart(e.target.value)}
          InputLabelProps={{ shrink: true }}
          fullWidth
          sx={{ flex: 1 }}
        />

        <TextField
          label="Fecha fin registro de equipos"
          type="date"
          value={registrationTeamEnd}
          onChange={(e) => setRegistrationTeamEnd(e.target.value)}
          InputLabelProps={{ shrink: true }}
          fullWidth
          sx={{ flex: 1 }}
        />
      </Box>
      <Button
        variant="outlined"
        color="secondary"
        onClick={handleClearFilters}
        sx={{ height: "40px", whiteSpace: "nowrap" }}
      >
        Limpiar filtros
      </Button>
    </Box>
  );
};

export default FilterTournaments;
