import {
  Box,
  Typography,
  TextField,
  Checkbox,
  FormControlLabel,
} from "@mui/material";

const SoccerRules = ({ rules, editable = false, onChange }) => {
  const handleChange = (field, value) => {
    if (!editable || !onChange) return;
    onChange({ ...rules, [field]: value });
  };

  return (
    <Box className="space-y-2">
      {editable ? (
        <>
          <TextField
            label="Duración del partido"
            type="text"
            value={rules.duration}
            onChange={(e) => handleChange("duration", e.target.value)}
            fullWidth
          />
          <TextField
            label="Jugadores en campo"
            type="number"
            value={rules.playersOnField}
            onChange={(e) => handleChange("playersOnField", e.target.value)}
            fullWidth
          />
          <TextField
            label="Jugadores mínimos por equipo"
            type="number"
            value={rules.minPlayers}
            onChange={(e) => handleChange("minPlayers", e.target.value)}
            fullWidth
          />

          <Typography fontWeight="bold">Disciplinarias:</Typography>
          <TextField
            label="Amarilla"
            type="text"
            value={rules.disciplinary.yellow}
            onChange={(e) =>
              handleChange("disciplinary", {
                ...rules.disciplinary,
                yellow: e.target.value,
              })
            }
            fullWidth
          />
          <TextField
            label="Dos amarillas"
            type="text"
            value={rules.disciplinary.twoYellows}
            onChange={(e) =>
              handleChange("disciplinary", {
                ...rules.disciplinary,
                twoYellows: e.target.value,
              })
            }
            fullWidth
          />
          <TextField
            label="Roja"
            type="text"
            value={rules.disciplinary.redCard}
            onChange={(e) =>
              handleChange("disciplinary", {
                ...rules.disciplinary,
                redCard: e.target.value,
              })
            }
            fullWidth
          />

          <Typography fontWeight="bold">Resultado:</Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={rules.result.draw}
                onChange={(e) =>
                  handleChange("result", {
                    ...rules.result,
                    draw: e.target.checked,
                  })
                }
              />
            }
            label="Empate permitido"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={rules.result.penaltyOnDraw}
                onChange={(e) =>
                  handleChange("result", {
                    ...rules.result,
                    penaltyOnDraw: e.target.checked,
                  })
                }
              />
            }
            label="Penales en empate"
          />

          <Typography fontWeight="bold">Puntos:</Typography>
          <TextField
            label="Victoria"
            type="number"
            value={rules.points.win}
            onChange={(e) =>
              handleChange("points", {
                ...rules.points,
                win: e.target.value,
              })
            }
            fullWidth
          />
          <TextField
            label="Empate"
            type="number"
            value={rules.points.draw}
            onChange={(e) =>
              handleChange("points", {
                ...rules.points,
                draw: e.target.value,
              })
            }
            fullWidth
          />
          <TextField
            label="Derrota"
            type="number"
            value={rules.points.loss}
            onChange={(e) =>
              handleChange("points", {
                ...rules.points,
                loss: e.target.value,
              })
            }
            fullWidth
          />
        </>
      ) : (
        <>
          <Typography className="text-gray-700 text-sm">
            <strong>Duración del partido:</strong> {rules.duration}
          </Typography>
          <Typography className="text-gray-700 text-sm">
            <strong>Jugadores en campo:</strong> {rules.playersOnField}
          </Typography>
          <Typography className="text-gray-700 text-sm">
            <strong>Jugadores mínimos por equipo:</strong> {rules.minPlayers}
          </Typography>
          <Typography className="text-gray-700 text-sm">
            <strong>Disciplinarias:</strong>
          </Typography>
          <Box component="ul">
            <li>
              <strong>Amarilla:</strong> {rules.disciplinary.yellow}
            </li>
            <li>
              <strong>Dos amarillas:</strong> {rules.disciplinary.twoYellows}
            </li>
            <li>
              <strong>Roja:</strong> {rules.disciplinary.redCard}
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
        </>
      )}
    </Box>
  );
};

export default SoccerRules;
