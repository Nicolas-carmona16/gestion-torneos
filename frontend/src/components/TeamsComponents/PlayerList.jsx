import {
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Person, Close } from "@mui/icons-material";

const PlayerList = ({
  players,
  currentUser,
  canModify,
  onDeletePlayer,
  team,
}) => {
  return (
    <>
      {players.length > 0 ? (
        <List dense sx={{ maxHeight: "300px", overflow: "auto" }}>
          {players.map((player, index) => (
            <ListItem
              key={player._id || index}
              secondaryAction={
                (currentUser?._id === team?.captain?._id ||
                  currentUser?.role === "admin") && (
                  <Tooltip
                    title={
                      canModify
                        ? "Eliminar jugador"
                        : `El periodo para modificar jugadores finalizó el ${new Date(
                            team.tournament.registrationPlayerEnd
                          ).toLocaleDateString()}`
                    }
                  >
                    <span>
                      <IconButton
                        edge="end"
                        color={canModify ? "error" : "default"}
                        onClick={() => canModify && onDeletePlayer(player._id)}
                        disabled={!canModify}
                      >
                        <Close fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                )
              }
            >
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: "primary.main" }}>
                  <Person />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={`${player.fullName}`}
                secondary={
                  <>
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.secondary"
                    >
                      Correo: {player.email}
                    </Typography>
                    {currentUser?.role === "admin" && (
                      <>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.secondary"
                          display="block"
                        >
                          Cédula: {player.idNumber}
                        </Typography>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.secondary"
                          display="block"
                        >
                          EPS: {player.eps}
                        </Typography>
                      </>
                    )}
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No hay jugadores registrados en este equipo
        </Typography>
      )}
    </>
  );
};

export default PlayerList;
