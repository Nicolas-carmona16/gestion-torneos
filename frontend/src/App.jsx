/**
 * @fileoverview Main App component that handles routing, theme, authentication state and protected routes.
 * @module App
 */

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  ThemeProvider,
  CssBaseline,
  CircularProgress,
  Box,
} from "@mui/material";
import Header from "./components/Header";
import Home from "./pages/Home";
import theme from "./theme/theme";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import { getUser } from "./services/authService";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import ManageUsers from "./pages/ManageUsers";
import ManageTournaments from "./pages/ManageTournaments";
import CreateTournament from "./pages/CreateTournament";
import CreateUser from "./pages/CreateUser";
import TeamRegistrationPage from "./pages/TeamRegistrationPage";
import ManageTeams from "./pages/ManageTeams";
import TournamentTeamsPage from "./pages/TournamentTeamsPage";
import ManagePairings from "./pages/ManagePairings";
import TournamentPairings from "./pages/TournamentPairings";
import ManageMatches from "./pages/ManageMatches";
import TournamentMatches from "./pages/TournamentMatches";

/**
 * Main App component responsible for rendering routes, layout, and theme.
 * Handles authentication check on mount and displays a loading spinner while checking.
 *
 * @component
 * @returns {JSX.Element} Rendered React component
 */
const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * useEffect hook to check user authentication status on initial load.
   */
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getUser();
        setIsAuthenticated(!!user);
      } catch (error) {
        console.error("Error al obtener usuario:", error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (loading || isAuthenticated === null) {
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

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="app-container">
          <Header
            isAuthenticated={isAuthenticated}
            setIsAuthenticated={setIsAuthenticated}
          />
          <Routes>
            {/* Ruta pública */}
            <Route path="*" element={<NotFound />} />
            <Route path="/" element={<Home />} />
            <Route
              path="/iniciar-sesion"
              element={<Login setIsAuthenticated={setIsAuthenticated} />}
            />
            <Route path="/inscripciones" element={<ManageTournaments />} />
            <Route path="/equipos" element={<ManageTeams />} />
            <Route
              path="/torneo/:tournamentId/equipos"
              element={<TournamentTeamsPage />}
            />
            <Route path="/emparejamientos" element={<ManagePairings />} />
            <Route
              path="/torneo/:tournamentId/emparejamientos"
              element={<TournamentPairings />}
            />
            <Route path="/programacion" element={<ManageMatches />} />
            <Route
              path="/torneo/:tournamentId/partidos"
              element={<TournamentMatches />}
            />
            {/* Ruta protegida */}
            <Route
              path="/perfil"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/torneo/:tournamentId/registro"
              element={
                <ProtectedRoute
                  isAuthenticated={isAuthenticated}
                  allowedRoles={["captain"]}
                >
                  <TeamRegistrationPage />
                </ProtectedRoute>
              }
            />
            {/* Ruta protegida solo para usuarios con rol 'admin' */}
            <Route
              path="/gestion-usuarios"
              element={
                <ProtectedRoute
                  isAuthenticated={isAuthenticated}
                  allowedRoles={["admin"]}
                >
                  <ManageUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/crear-torneo"
              element={
                <ProtectedRoute
                  isAuthenticated={isAuthenticated}
                  allowedRoles={["admin"]}
                >
                  <CreateTournament />
                </ProtectedRoute>
              }
            />
            <Route
              path="/crear-usuario"
              element={
                <ProtectedRoute
                  isAuthenticated={isAuthenticated}
                  allowedRoles={["admin"]}
                >
                  <CreateUser />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
};

export default App;
