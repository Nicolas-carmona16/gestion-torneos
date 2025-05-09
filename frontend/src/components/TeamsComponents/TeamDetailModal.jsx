import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Grid,
  Divider,
  Button,
  IconButton,
} from "@mui/material";
import { Groups, Close, Add } from "@mui/icons-material";
import PlayerList from "./PlayerList";

const TeamDetailsModal = ({
  open,
  onClose,
  team,
  currentUser,
  onAddPlayer,
  canModify,
  onDeletePlayer,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
      disableRestoreFocus
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            <Groups sx={{ verticalAlign: "middle", mr: 1 }} />
            {team?.name}
          </Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {team && (
          <Box>
            <Box mb={3}>
              <Typography variant="subtitle1" gutterBottom color="primary">
                Información del equipo
              </Typography>
              <Grid container spacing={2}>
                <Grid sx={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Capitán
                  </Typography>
                  <Typography variant="body1">
                    {team.captain?.firstName} {team.captain?.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {team.captain?.email}
                  </Typography>
                </Grid>
                <Grid sx={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Fecha de registro
                  </Typography>
                  <Typography variant="body1">
                    {new Date(team.createdAt).toLocaleDateString()}
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="subtitle1" gutterBottom color="primary">
                  Jugadores ({team.players?.length || 0})
                </Typography>
                {(currentUser?.role === "admin" ||
                  currentUser?._id === team?.captain?._id) && (
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Add />}
                    onClick={onAddPlayer}
                    disabled={!canModify}
                  >
                    Agregar
                  </Button>
                )}
              </Box>

              <PlayerList
                players={team.players || []}
                currentUser={currentUser}
                canModify={canModify}
                onDeletePlayer={onDeletePlayer}
                team={team}
              />
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TeamDetailsModal;
