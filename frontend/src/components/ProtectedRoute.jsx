import { Navigate } from "react-router-dom";
import { CircularProgress, Box } from "@mui/material";
import { getUser } from "../services/authService";
import { useEffect, useState } from "react";

/**
 * @module ProtectedRoute
 * @component
 * @description A route guard component that restricts access based on user authentication and role permissions.
 *              It fetches the current user on mount and checks if the user is allowed to access the route.
 *
 * @param {Object} props - Component props.
 * @param {boolean} props.isAuthenticated - Indicates if the user is authenticated.
 * @param {Array<string>} [props.allowedRoles] - An optional array of allowed roles for this route.
 * @param {JSX.Element} props.children - The component to render if access is allowed.
 *
 * @returns {JSX.Element} The protected content, a redirect to login, or a redirect to home based on conditions.
 *
 * @example
 * <ProtectedRoute isAuthenticated={true} allowedRoles={['admin']}>
 *   <AdminDashboard />
 * </ProtectedRoute>
 */
const ProtectedRoute = ({ isAuthenticated, allowedRoles, children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await getUser();
        setUser(currentUser);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/iniciar-sesion" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
