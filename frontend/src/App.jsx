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
import Register from "./pages/Register";
import theme from "./theme/theme";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import { getUser } from "./services/authService";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import ManageUsers from "./pages/ManageUsers";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true);

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
            <Route path="*" element={<NotFound />} />
            <Route path="/" element={<Home />} />
            <Route
              path="/registrarse"
              element={<Register setIsAuthenticated={setIsAuthenticated} />}
            />
            <Route
              path="/iniciar-sesion"
              element={<Login setIsAuthenticated={setIsAuthenticated} />}
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
            {/* Ruta protegida solo para usuarios con rol 'admin' */}
            <Route
              path="/gestion-usuarios"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <ManageUsers />
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
