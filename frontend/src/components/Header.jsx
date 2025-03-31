import { useState } from "react";
import {
  AppBar,
  Toolbar,
  Button,
  Typography,
  Menu,
  MenuItem,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import logo from "../assets/logoUdeA.png";
import { logoutUser } from "../services/authService";

const Header = ({ isAuthenticated, setIsAuthenticated }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

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
        className="flex justify-between items-center"
        style={{ minHeight: "100px" }}
      >
        <Link to="/" className="flex items-center gap-2">
          <HomeIcon className="text-white" style={{ fontSize: "32px" }} />
          <Typography variant="h5" className="text-white ml-2">
            Torneos UdeA
          </Typography>
        </Link>
        <Link to={"/"}>
          <img src={logo} alt="Logo" className="h-20" />
        </Link>
        {!isAuthenticated ? (
          <div>
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
            <Button
              color="inherit"
              component={Link}
              to="/registrarse"
              sx={{
                backgroundColor: "transparent",
                "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.1)" },
              }}
            >
              Registrarse
            </Button>
          </div>
        ) : (
          <div>
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
              <MenuItem onClick={handleLogout}>Cerrar sesión</MenuItem>
            </Menu>
          </div>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
