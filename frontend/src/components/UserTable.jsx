import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { formatBirthDate } from "../utils/dateUtils";
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
  return (
    <TableContainer>
      <Table>
        <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
          <TableRow sx={{ fontWeight: "bold" }}>
            <TableCell sx={{ fontWeight: "bold" }}>Nombre</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Correo</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>
              Fecha de Nacimiento
            </TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Rol</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredUsers.slice(page * 5, (page + 1) * 5).map((user) => (
            <TableRow key={user._id}>
              <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{formatBirthDate(user.birthDate)}</TableCell>
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
    </TableContainer>
  );
};

export default UserTable;
