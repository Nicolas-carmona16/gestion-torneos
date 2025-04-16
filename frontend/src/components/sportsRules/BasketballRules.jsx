import { Box, Typography } from "@mui/material";

const BasketballRules = ({ rules }) => (
  <Box className="space-y-2">
    <Typography className="text-gray-700 text-sm">
      <strong>Cuartos:</strong> {rules.quarters}
    </Typography>
    <Typography className="text-gray-700 text-sm">
      <strong>Minutos por cuarto:</strong> {rules.minutesPerQuarter}
    </Typography>
    <Typography className="text-gray-700 text-sm">
      <strong>Jugadores en campo:</strong> {rules.playersOnField}
    </Typography>
    <Typography className="text-gray-700 text-sm">
      <strong>Puntos:</strong>
    </Typography>
    <Box component="ul">
      <li>
        <strong>Libre:</strong> {rules.scoring.freeThrow} puntos
      </li>
      <li>
        <strong>Dentro del arco:</strong> {rules.scoring.insideArc} puntos
      </li>
      <li>
        <strong>Fuera del arco:</strong> {rules.scoring.beyondArc} puntos
      </li>
    </Box>
    <Typography className="text-gray-700 text-sm">
      <strong>Faltas:</strong>
    </Typography>
    <Box component="ul">
      <li>
        <strong>Límite personal:</strong> {rules.fouls.personalLimit} faltas
      </li>
      <li>
        <strong>Faltas de equipo por cuarto:</strong>{" "}
        {rules.fouls.teamFoulsPerQuarter}
      </li>
    </Box>
    <Typography className="text-gray-700 text-sm">
      <strong>Empate:</strong> {rules.draw ? "Permitido" : "No permitido"}
    </Typography>
  </Box>
);

export default BasketballRules;
