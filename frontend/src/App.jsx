import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import Header from "./components/Header";
import Home from "./pages/Home";
import Register from "./pages/Register";
import theme from "./theme/theme";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import { getUser } from "./services/authService";
import Profile from "./pages/Profile";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const user = await getUser();
      setIsAuthenticated(!!user);
    };
    checkAuth();
  }, []);

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
            <Route path="/perfil" element={<Profile />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
};

export default App;
