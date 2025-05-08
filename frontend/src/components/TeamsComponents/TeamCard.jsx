import {
  Card,
  CardContent,
  Avatar,
  Typography,
  Divider,
  Chip,
  Button,
  Box,
  Tooltip,
} from "@mui/material";
import { Groups, Person, People, CalendarToday } from "@mui/icons-material";

const TeamCard = ({ team, onClick }) => {
  return (
    <Card
      elevation={3}
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar sx={{ bgcolor: "primary.main", mr: 2 }}>
            <Groups />
          </Avatar>
          <Typography variant="h6" component="div">
            {team.name}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box mb={2}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            <Person sx={{ verticalAlign: "middle", mr: 1 }} />
            Capitán
          </Typography>
          <Typography variant="body1">
            {team.captain?.firstName} {team.captain?.lastName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {team.captain?.email}
          </Typography>
        </Box>

        <Box mb={2}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            <People sx={{ verticalAlign: "middle", mr: 1 }} />
            Jugadores
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            <Tooltip
              title={`${team.players?.length || 0} jugadores registrados`}
            >
              <Chip
                label={`${team.players?.length || 0} jugadores`}
                color="primary"
                size="small"
              />
            </Tooltip>
          </Box>
        </Box>

        <Box>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            <CalendarToday sx={{ verticalAlign: "middle", mr: 1 }} />
            Fecha de registro
          </Typography>
          <Typography>
            {new Date(team.createdAt).toLocaleDateString()}
          </Typography>
        </Box>
      </CardContent>

      <Box sx={{ p: 2, bgcolor: "background.default" }}>
        <Button
          fullWidth
          variant="outlined"
          onClick={onClick}
          aria-label={`Ver detalles de ${team.name}`}
        >
          Ver detalles
        </Button>
      </Box>
    </Card>
  );
};

export default TeamCard;
