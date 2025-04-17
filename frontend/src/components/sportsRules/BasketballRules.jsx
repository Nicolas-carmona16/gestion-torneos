import {
  Box,
  Typography,
  TextField,
  Checkbox,
  FormControlLabel,
} from "@mui/material";

const BasketballRules = ({ rules, editable = false, onChange }) => {
  const handleChange = (field, value) => {
    if (!editable || !onChange) return;
    onChange({ ...rules, [field]: value });
  };

  return (
    <Box className="space-y-2">
      {editable ? (
        <>
          <TextField
            label="Cuartos"
            type="number"
            value={rules.quarters}
            onChange={(e) => handleChange("quarters", e.target.value)}
            fullWidth
          />
          <TextField
            label="Minutos por cuarto"
            type="number"
            value={rules.minutesPerQuarter}
            onChange={(e) => handleChange("minutesPerQuarter", e.target.value)}
            fullWidth
          />
          <TextField
            label="Jugadores en campo"
            type="number"
            value={rules.playersOnField}
            onChange={(e) => handleChange("playersOnField", e.target.value)}
            fullWidth
          />

          <Typography fontWeight="bold">Puntos:</Typography>
          <TextField
            label="Libre"
            type="number"
            value={rules.scoring.freeThrow}
            onChange={(e) =>
              handleChange("scoring", {
                ...rules.scoring,
                freeThrow: e.target.value,
              })
            }
            fullWidth
          />
          <TextField
            label="Dentro del arco"
            type="number"
            value={rules.scoring.insideArc}
            onChange={(e) =>
              handleChange("scoring", {
                ...rules.scoring,
                insideArc: e.target.value,
              })
            }
            fullWidth
          />
          <TextField
            label="Fuera del arco"
            type="number"
            value={rules.scoring.beyondArc}
            onChange={(e) =>
              handleChange("scoring", {
                ...rules.scoring,
                beyondArc: e.target.value,
              })
            }
            fullWidth
          />

          <Typography fontWeight="bold">Faltas:</Typography>
          <TextField
            label="Límite personal"
            type="number"
            value={rules.fouls.personalLimit}
            onChange={(e) =>
              handleChange("fouls", {
                ...rules.fouls,
                personalLimit: e.target.value,
              })
            }
            fullWidth
          />
          <TextField
            label="Faltas de equipo por cuarto"
            type="number"
            value={rules.fouls.teamFoulsPerQuarter}
            onChange={(e) =>
              handleChange("fouls", {
                ...rules.fouls,
                teamFoulsPerQuarter: e.target.value,
              })
            }
            fullWidth
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={rules.draw}
                onChange={(e) => handleChange("draw", e.target.checked)}
              />
            }
            label="Empate permitido"
          />
        </>
      ) : (
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
              <strong>Límite personal:</strong> {rules.fouls.personalLimit}{" "}
              faltas
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
      )}
    </Box>
  );
};

export default BasketballRules;
