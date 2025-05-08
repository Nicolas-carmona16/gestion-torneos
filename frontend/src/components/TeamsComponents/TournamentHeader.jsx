import { Box, Typography, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const TournamentHeader = ({ tournament, teamsCount, onBack }) => {
  return (
    <Box display="flex" justifyContent="flex-start" alignItems="center" mb={3}>
      <IconButton onClick={onBack} color="primary">
        <ArrowBackIcon />
      </IconButton>
      <Box ml={2}>
        <Typography variant="h4" gutterBottom color="primary">
          {tournament.name}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Equipos registrados: {teamsCount}
        </Typography>
      </Box>
    </Box>
  );
};

export default TournamentHeader;
