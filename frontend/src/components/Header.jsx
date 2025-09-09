import { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Button,
  Typography,
  Menu,
  MenuItem,
  Divider,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SettingsIcon from "@mui/icons-material/Settings";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import logo from "../assets/logoUdeA.png";
import { logoutUser, getUser } from "../services/authService";

/**
 * @module Header
 * @component
 * @description Navigation bar that shows app title, logo, and login/logout options based on user authentication state.
 *
 * @param {Object} props - Component props.
 * @param {boolean} props.isAuthenticated - Whether the user is currently authenticated.
 * @param {Function} props.setIsAuthenticated - Function to update the authentication state after logout.
 *
 * @returns {JSX.Element} The application header with navigation links and user menu.
 *
 * @example
 * <Header isAuthenticated={true} setIsAuthenticated={setAuth} />
 */
const Header = ({ isAuthenticated, setIsAuthenticated }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      const fetchUser = async () => {
        try {
          const userData = await getUser();
          setUser(userData);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };
      fetchUser();
    }
  }, [isAuthenticated]);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    await logoutUser();
    setIsAuthenticated(false);
    navigate("/iniciar-sesion");
  };

  return (
    <AppBar
      position="static"
      style={{ backgroundColor: "#026937", height: "100px" }}
      className="shadow-md"
    >
      <Toolbar
        style={{ 
          minHeight: "100px",
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          gap: "16px"
        }}
      >
        <Link to="/" className="flex items-center gap-2">
          <HomeIcon className="text-white" style={{ fontSize: "32px" }} />
          <Typography variant="h5" className="text-white ml-2">
            Torneos UdeA
          </Typography>
        </Link>
        <Link to={"/"} style={{ display: "flex", justifyContent: "center" }}>
          <img src={logo} alt="Logo" className="h-20" />
        </Link>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          {!isAuthenticated ? (
            <Button
              color="inherit"
              component={Link}
              to="/iniciar-sesion"
              sx={{
                backgroundColor: "transparent",
                "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.1)" },
              }}
            >
              Iniciar sesión
            </Button>
          ) : (
            <Button
              color="inherit"
              onClick={handleMenuOpen}
              sx={{
                backgroundColor: "transparent",
                "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.1)" },
              }}
            >
              <AccountCircleIcon style={{ fontSize: "40px" }} />
            </Button>
          )}
        </div>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          disableScrollLock
        >
          <MenuItem
            onClick={() => {
              handleMenuClose();
              navigate("/perfil");
            }}
          >
            Perfil
          </MenuItem>
          {user?.role === "admin" && (
            <>
              <Divider />
              <MenuItem
                onClick={() => {
                  handleMenuClose();
                  navigate("/gestion-usuarios");
                }}
              >
                <SettingsIcon sx={{ mr: 1 }} />
                Gestión de Usuarios
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleMenuClose();
                  navigate("/gestion-carrusel");
                }}
              >
                <PhotoLibraryIcon sx={{ mr: 1 }} />
                Gestión del Carrusel
              </MenuItem>
            </>
          )}
          <Divider />
          <MenuItem onClick={handleLogout}>Cerrar sesión</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
