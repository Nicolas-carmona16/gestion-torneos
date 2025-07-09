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
  IconButton,
} from "@mui/material";
import {
  Groups,
  Person,
  People,
  CalendarToday,
  Edit,
} from "@mui/icons-material";

const TeamCard = ({ team, onClick, currentUser, onEditName }) => {
  const isAdmin = currentUser?.role === "admin";

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
          <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              {team.name}
            </Typography>
            {isAdmin && (
              <Tooltip title="Editar nombre del equipo">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditName(team);
                  }}
                  sx={{ ml: 1 }}
                >
                  <Edit fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
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
