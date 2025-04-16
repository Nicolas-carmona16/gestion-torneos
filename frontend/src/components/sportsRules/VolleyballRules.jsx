import { Box, Typography } from "@mui/material";

const VolleyballRules = ({ rules }) => (
  <Box className="space-y-2">
    <Typography className="text-gray-700 text-sm">
      <strong>Sets para ganar:</strong> {rules.setsToWin}
    </Typography>
    <Typography className="text-gray-700 text-sm">
      <strong>Jugadores en campo:</strong> {rules.playersOnField}
    </Typography>
    <Typography className="text-gray-700 text-sm">
      <strong>Puntos por set:</strong>
    </Typography>
    <Box component="ul">
      <li>
        <strong>Set regular:</strong> {rules.sets.regularSetPoints} puntos
      </li>
      <li>
        <strong>Último set:</strong> {rules.sets.lastSetPoints} puntos
      </li>
      <li>
        <strong>Diferencia mínima:</strong> {rules.sets.minDifference} puntos
      </li>
    </Box>
    <Typography className="text-gray-700 text-sm">
      <strong>Puntaje por resultado:</strong>
    </Typography>
    <Box component="ul">
      <li>
        <strong>Victoria 3-0 o 3-1:</strong> {rules.scoring.win3_0_or_3_1}{" "}
        puntos
      </li>
      <li>
        <strong>Victoria 3-2:</strong> {rules.scoring.win3_2} puntos
      </li>
      <li>
        <strong>Derrota 2-3:</strong> {rules.scoring.loss2_3} puntos
      </li>
      <li>
        <strong>Derrota 1-3 o 0-3:</strong> {rules.scoring.loss1_3_or_0_3}{" "}
        puntos
      </li>
    </Box>
    <Typography className="text-gray-700 text-sm">
      <strong>Empate:</strong> {rules.draw ? "Permitido" : "No permitido"}
    </Typography>
  </Box>
);

export default VolleyballRules;
