import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Box,
  Chip,
  Popover,
  Button,
  Paper,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useState } from "react";
import { roleMapping } from "../utils/roleUtils";

/**
 * @module UserTable
 * @component
 * @description Displays a paginated table of users with options to edit or delete each user.
 *
 * @param {Object} props - Component props.
 * @param {Array<Object>} props.filteredUsers - The list of users to display, possibly filtered from the full user list.
 * @param {number} props.page - The current pagination page (0-indexed).
 * @param {function} props.handleEditUser - Callback when the edit button is clicked for a user.
 * @param {function} props.handleDeleteUser - Callback when the delete button is clicked for a user.
 *
 * @returns {JSX.Element} A Material UI table displaying user information and actions.
 *
 * @example
 * <UserTable
 *   filteredUsers={users}
 *   page={0}
 *   handleEditUser={editUserHandler}
 *   handleDeleteUser={deleteUserHandler}
 * />
 */
const UserTable = ({
  filteredUsers,
  page,
  handleEditUser,
  handleDeleteUser,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentItems, setCurrentItems] = useState([]);
  const [popoverType, setPopoverType] = useState("");

  const handleOpenPopover = (event, items, type) => {
    setAnchorEl(event.currentTarget);
    setCurrentItems(items);
    setPopoverType(type);
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
    setCurrentItems([]);
    setPopoverType("");
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  return (
    <TableContainer>
      <Table>
        <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
          <TableRow sx={{ fontWeight: "bold" }}>
            <TableCell sx={{ fontWeight: "bold" }}>Nombre</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Correo</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Deportes</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Torneos</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Rol</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredUsers.slice(page * 5, (page + 1) * 5).map((user) => (
            <TableRow key={`user-${user._id}`}>
              <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  {user.sports && user.sports.length > 0 ? (
                    <>
                      <Chip
                        key={`sport-${user.sports[0]._id}`}
                        label={user.sports[0].name}
                        size="small"
                        color="secondary"
                        variant="outlined"
                      />
                      {user.sports.length > 1 && (
                        <Button
                          size="small"
                          sx={{ minWidth: 24, height: 24 }}
                          onClick={(e) =>
                            handleOpenPopover(e, user.sports, "sports")
                          }
                        >
                          +{user.sports.length - 1}
                        </Button>
                      )}
                    </>
                  ) : (
                    "-"
                  )}
                </Box>
              </TableCell>
              <TableCell>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  {user.tournaments && user.tournaments.length > 0 ? (
                    <>
                      <Chip
                        key={`tournament-${user.tournaments[0]._id}`}
                        label={user.tournaments[0].name}
                        size="small"
                        color="secondary"
                        variant="outlined"
                      />
                      {user.tournaments.length > 1 && (
                        <Button
                          size="small"
                          sx={{ minWidth: 24, height: 24 }}
                          onClick={(e) =>
                            handleOpenPopover(
                              e,
                              user.tournaments,
                              "tournaments"
                            )
                          }
                        >
                          +{user.tournaments.length - 1}
                        </Button>
                      )}
                    </>
                  ) : (
                    "-"
                  )}
                </Box>
              </TableCell>
              <TableCell>{roleMapping[user.role] || user.role}</TableCell>
              <TableCell sx={{ textAlign: "left", width: "15%" }}>
                <IconButton
                  color="primary"
                  onClick={() => handleEditUser(user)}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  color="secondary"
                  onClick={() => handleDeleteUser(user._id)}
                >
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <Paper sx={{ p: 2, maxWidth: 300 }}>
          <Typography variant="subtitle1" gutterBottom>
            {popoverType === "sports" ? "Deportes" : "Torneos"} adicionales
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {currentItems.slice(1).map((item) => (
              <Chip
                key={item._id}
                label={item.name}
                size="small"
                color={popoverType === "sports" ? "secondary" : "primary"}
                variant="outlined"
              />
            ))}
          </Box>
        </Paper>
      </Popover>
    </TableContainer>
  );
};

export default UserTable;
