import {
  Box,
  Typography,
  TextField,
  Checkbox,
  FormControlLabel,
} from "@mui/material";

const updateNestedField = (obj, path, value) => {
  const keys = path.split(".");
  const lastKey = keys.pop();

  return keys.reduceRight(
    (acc, key, index) => {
      return { [key]: index === 0 ? { ...obj[key], ...acc } : acc };
    },
    { [lastKey]: value }
  );
};

const FutsalRules = ({ rules, editable = false, onChange }) => {
  const handleChange = (field, value) => {
    if (!editable || !onChange) return;

    const updatedField = updateNestedField(rules, field, value);
    onChange({ ...rules, ...updatedField });
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
            onChange={(e) =>
              handleChange("playersOnField", Number(e.target.value))
            }
            fullWidth
          />

          <Typography fontWeight="bold">Faltas:</Typography>
          <TextField
            label="Límite por mitad"
            type="number"
            value={rules.fouls.limitPerHalf}
            onChange={(e) =>
              handleChange("fouls.limitPerHalf", Number(e.target.value))
            }
            fullWidth
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={rules.fouls.sixthFoulPenalty}
                onChange={(e) =>
                  handleChange("fouls.sixthFoulPenalty", e.target.checked)
                }
              />
            }
            label="Sexta falta penaliza"
          />

          <Typography fontWeight="bold">Resultado:</Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={rules.result.draw}
                onChange={(e) => handleChange("result.draw", e.target.checked)}
              />
            }
            label="Permitir empate"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={rules.result.penaltyOnDraw}
                onChange={(e) =>
                  handleChange("result.penaltyOnDraw", e.target.checked)
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
            onChange={(e) => handleChange("points.win", Number(e.target.value))}
            fullWidth
          />
          <TextField
            label="Empate"
            type="number"
            value={rules.points.draw}
            onChange={(e) =>
              handleChange("points.draw", Number(e.target.value))
            }
            fullWidth
          />
          <TextField
            label="Derrota"
            type="number"
            value={rules.points.loss}
            onChange={(e) =>
              handleChange("points.loss", Number(e.target.value))
            }
            fullWidth
          />
        </>
      ) : (
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
              <strong>Límite por mitad:</strong> {rules.fouls.limitPerHalf}{" "}
              faltas
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
              <strong>Permitir empate:</strong>{" "}
              {rules.result.draw ? "Sí" : "No"}
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
      )}
    </Box>
  );
};

export default FutsalRules;
