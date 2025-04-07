import { Box, Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";

/**
 * @module NotFound
 * @description Component shown when no route matches (404 page).
 * @returns {JSX.Element} Not found error page.
 */
const NotFound = () => {
  return (
    <Box
      className="flex flex-col items-center px-4"
      style={{ marginTop: "10vh" }}
    >
      <SentimentDissatisfiedIcon
        style={{ fontSize: 80 }}
        className="mb-6"
        color="primary"
      />
      <Typography
        variant="h1"
        className="text-6xl font-extrabold text-center"
        color="primary"
      >
        404
      </Typography>
      <Typography
        variant="h6"
        className="text-lg text-center mt-4 text-gray-600"
        style={{ marginBottom: "2rem" }}
      >
        ¡Oops! La página que estás buscando no se encuentra disponible.
      </Typography>
      <Button
        variant="contained"
        component={Link}
        to="/"
        style={{ padding: "10px 20px", fontSize: "16px" }}
      >
        Volver al Inicio
      </Button>
    </Box>
  );
};

export default NotFound;
