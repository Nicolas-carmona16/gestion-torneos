import { Box, Typography } from "@mui/material";

const FutsalRules = ({ rules }) => (
  <Box className="space-y-2">
    <Typography className="text-gray-700 text-sm">
      <strong>Duración del partido:</strong> {rules.duration}
    </Typography>
    <Typography className="text-gray-700 text-sm">
      <strong>Jugadores en campo:</strong> {rules.playersOnField}
    </Typography>
    <Typography className="text-gray-700 text-sm">
      <strong>Faltas:</strong>
    </Typography>
    <Box component="ul">
      <li>
        <strong>Límite por mitad:</strong> {rules.fouls.limitPerHalf} faltas
      </li>
      <li>
        <strong>Sexta falta penaliza:</strong>{" "}
        {rules.fouls.sixthFoulPenalty ? "Sí" : "No"}
      </li>
    </Box>
    <Typography className="text-gray-700 text-sm">
      <strong>Resultado:</strong>
    </Typography>
    <Box component="ul">
      <li>
        <strong>Empate:</strong>{" "}
        {rules.result.draw ? "Permitido" : "No permitido"}
      </li>
      <li>
        <strong>Penales en empate:</strong>{" "}
        {rules.result.penaltyOnDraw ? "Sí" : "No"}
      </li>
    </Box>
    <Typography className="text-gray-700 text-sm">
      <strong>Puntos:</strong>
    </Typography>
    <Box component="ul">
      <li>
        <strong>Victoria:</strong> {rules.points.win} puntos
      </li>
      <li>
        <strong>Empate:</strong> {rules.points.draw} puntos
      </li>
      <li>
        <strong>Derrota:</strong> {rules.points.loss} puntos
      </li>
    </Box>
  </Box>
);

export default FutsalRules;
