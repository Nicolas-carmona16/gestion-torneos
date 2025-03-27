import { AppBar, Toolbar, Button, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import logo from "../assets/logoUdeA.png";

const Header = ({ isAuthenticated }) => {
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
          <img src={logo} alt="Logo" className="h-20" />{" "}
        </Link>
        {!isAuthenticated ? (
          <div>
            <Button color="inherit" component={Link} to="/iniciar-sesion">
              Iniciar sesión
            </Button>
            <Button color="inherit" component={Link} to="/registrarse">
              Registrarse
            </Button>
          </div>
        ) : (
          <Button color="inherit" component={Link} to="/cerrar-sesion">
            Cerrar sesión
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
