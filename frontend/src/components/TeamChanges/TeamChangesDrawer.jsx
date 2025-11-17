/**
 * @module TeamChangesDrawer
 * @component
 * @description Drawer component that displays team change notifications for admins
 */

import { useState, useEffect } from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Chip,
  Button,
  Divider,
  CircularProgress,
  Alert,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import {
  getAllChangeLogs,
  markChangeAsRead,
  markAllChangesAsRead,
} from "../../services/changeLogService";

/**
 * Component to display team change notifications in a drawer
 * @param {Object} props - Component props
 * @param {boolean} props.open - Whether the drawer is open
 * @param {Function} props.onClose - Function to close the drawer
 * @param {Function} props.onDecrementCount - Function to decrement unread counter
 * @param {Array} props.liveChanges - Live changes from WebSocket hook
 * @returns {JSX.Element} Team changes drawer component
 */
const TeamChangesDrawer = ({ open, onClose, onDecrementCount, liveChanges }) => {
  const [changes, setChanges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // "all" or "unread"

  /**
   * Fetches all change logs when drawer opens
   */
  useEffect(() => {
    if (open) {
      fetchChanges();
    }
  }, [open]);

  /**
   * Add new changes from WebSocket to the existing list
   */
  useEffect(() => {
    if (liveChanges && liveChanges.length > 0) {
      setChanges((prevChanges) => {
        // Get IDs of existing changes
        const existingIds = new Set(prevChanges.map(c => c._id));
        
        // Filter only new changes that don't exist yet
        const newChanges = liveChanges.filter(change => !existingIds.has(change._id));
        
        // Add new changes at the beginning
        if (newChanges.length > 0) {
          return [...newChanges, ...prevChanges];
        }
        
        return prevChanges;
      });
    }
  }, [liveChanges]);

  const fetchChanges = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllChangeLogs();
      setChanges(data);
    } catch (err) {
      setError("Error al cargar las novedades");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Marks a single change as read
   */
  const handleMarkAsRead = async (changeId) => {
    try {
      await markChangeAsRead(changeId);
      // Update local state immediately
      setChanges((prev) =>
        prev.map((change) =>
          change._id === changeId
            ? { ...change, readBy: ["read"] } // Mark as read
            : change
        )
      );
      // Decrement the unread count in parent
      onDecrementCount?.(1);
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  /**
   * Marks all changes as read
   */
  const handleMarkAllAsRead = async () => {
    try {
      // Count unread changes before marking
      const unreadChanges = changes.filter(change => !change.readBy || change.readBy.length === 0).length;
      
      await markAllChangesAsRead();
      // Update all changes to mark as read
      setChanges((prev) =>
        prev.map((change) => ({ ...change, readBy: ["read"] }))
      );
      // Decrement the unread count by the number of unread changes
      onDecrementCount?.(unreadChanges);
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  /**
   * Returns the appropriate icon based on change type
   */
  const getChangeIcon = (type) => {
    switch (type) {
      case "inscription":
        return <GroupAddIcon color="primary" />;
      case "add_player":
        return <PersonAddIcon color="success" />;
      case "remove_player":
        return <PersonRemoveIcon color="error" />;
      default:
        return null;
    }
  };

  /**
   * Returns the appropriate color based on change type
   */
  const getChangeColor = (type) => {
    switch (type) {
      case "inscription":
        return "primary";
      case "add_player":
        return "success";
      case "remove_player":
        return "error";
      default:
        return "default";
    }
  };

  /**
   * Returns human-readable label for change type
   */
  const getChangeLabel = (type) => {
    switch (type) {
      case "inscription":
        return "Inscripción";
      case "add_player":
        return "Jugador Agregado";
      case "remove_player":
        return "Jugador Eliminado";
      default:
        return type;
    }
  };

  /**
   * Formats date to readable string
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return "Hace menos de 1 hora";
    if (hours < 24) return `Hace ${hours} hora${hours > 1 ? "s" : ""}`;
    if (days < 7) return `Hace ${days} día${days > 1 ? "s" : ""}`;
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  /**
   * Filter changes based on selected filter
   */
  const filteredChanges = filter === "unread" 
    ? changes.filter(change => !change.readBy || change.readBy.length === 0)
    : changes;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: "100%", sm: 450 } },
      }}
    >
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Novedades de Equipos
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Filter and Actions */}
        {changes.length > 0 && (
          <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
            {/* Filter Tabs */}
            <ToggleButtonGroup
              value={filter}
              exclusive
              onChange={(e, newFilter) => {
                if (newFilter !== null) {
                  setFilter(newFilter);
                }
              }}
              fullWidth
              size="small"
              sx={{ mb: 2 }}
            >
              <ToggleButton value="all">
                Todas ({changes.length})
              </ToggleButton>
              <ToggleButton value="unread">
                No leídas ({changes.filter(c => !c.readBy || c.readBy.length === 0).length})
              </ToggleButton>
            </ToggleButtonGroup>

            {/* Mark all as read button */}
            <Button
              size="small"
              startIcon={<DoneAllIcon />}
              onClick={handleMarkAllAsRead}
              variant="outlined"
              fullWidth
            >
              Marcar todas como leídas
            </Button>
          </Box>
        )}

        {/* Content */}
        <Box sx={{ flex: 1, overflow: "auto" }}>
          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box sx={{ p: 2 }}>
              <Alert severity="error">{error}</Alert>
            </Box>
          ) : filteredChanges.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                p: 3,
                textAlign: "center",
              }}
            >
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {filter === "unread" ? "No hay novedades sin leer" : "No hay novedades"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {filter === "unread" 
                  ? "Todas las novedades han sido leídas" 
                  : "Aquí aparecerán las inscripciones y cambios de jugadores"}
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {filteredChanges.map((change, index) => (
                <Box key={change._id}>
                  <ListItem
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      p: 2,
                      bgcolor: change.readBy?.length > 0 ? "transparent" : "action.hover",
                      "&:hover": {
                        bgcolor: "action.selected",
                      },
                    }}
                  >
                    {/* Header with icon and type */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                        mb: 1,
                      }}
                    >
                      <Box sx={{ mr: 2 }}>{getChangeIcon(change.type)}</Box>
                      <Box sx={{ flex: 1 }}>
                        <Chip
                          label={getChangeLabel(change.type)}
                          size="small"
                          color={getChangeColor(change.type)}
                          sx={{ mb: 0.5 }}
                        />
                      </Box>
                      {change.readBy?.length === 0 && (
                        <Chip label="Nueva" size="small" color="error" />
                      )}
                    </Box>

                    {/* Description */}
                    <ListItemText
                      primary={change.description}
                      secondary={
                        <>
                          <Typography
                            component="span"
                            variant="caption"
                            color="text.secondary"
                            display="block"
                          >
                            Por: {change.responsible?.firstName}{" "}
                            {change.responsible?.lastName}
                          </Typography>
                          <Typography
                            component="span"
                            variant="caption"
                            color="text.secondary"
                          >
                            {formatDate(change.createdAt)}
                          </Typography>
                        </>
                      }
                      primaryTypographyProps={{
                        variant: "body2",
                        sx: { mb: 0.5 },
                      }}
                    />

                    {/* Mark as read button */}
                    {change.readBy?.length === 0 && (
                      <Button
                        size="small"
                        onClick={() => handleMarkAsRead(change._id)}
                        sx={{ mt: 1 }}
                      >
                        Marcar como leída
                      </Button>
                    )}
                  </ListItem>
                  {index < changes.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          )}
        </Box>
      </Box>
    </Drawer>
  );
};

export default TeamChangesDrawer;
