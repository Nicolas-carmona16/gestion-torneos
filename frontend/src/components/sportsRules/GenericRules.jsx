import {
  Box,
  Typography,
  TextField,
} from "@mui/material";

const GenericRules = ({ rules, editable = false, onChange }) => {
  const handleChange = (field, value) => {
    if (!editable || !onChange) return;
    onChange({ ...rules, [field]: value });
  };

  return (
    <Box className="space-y-2">
      {editable ? (
        <>
          <Typography fontWeight="bold">Sistema de Puntuación:</Typography>
          <TextField
            label="Puntos por Victoria"
            type="number"
            value={rules.points?.win ?? 3}
            onChange={(e) =>
              handleChange("points", {
                ...rules.points,
                win: Number(e.target.value),
              })
            }
            fullWidth
            inputProps={{ min: 0 }}
          />
          <TextField
            label="Puntos por Empate"
            type="number"
            value={rules.points?.draw ?? 1}
            onChange={(e) =>
              handleChange("points", {
                ...rules.points,
                draw: Number(e.target.value),
              })
            }
            fullWidth
            inputProps={{ min: 0 }}
          />
          <TextField
            label="Puntos por Derrota"
            type="number"
            value={rules.points?.loss ?? 0}
            onChange={(e) =>
              handleChange("points", {
                ...rules.points,
                loss: Number(e.target.value),
              })
            }
            fullWidth
            inputProps={{ min: 0 }}
          />
        </>
      ) : (
        <Box className="space-y-2">
          <Typography className="text-gray-700 text-sm">
            <strong>Sistema de Puntuación:</strong>
          </Typography>
          <Box component="ul">
            <li>
              <strong>Victoria:</strong> {rules.points?.win ?? 3} puntos
            </li>
            <li>
              <strong>Empate:</strong> {rules.points?.draw ?? 1} puntos
            </li>
            <li>
              <strong>Derrota:</strong> {rules.points?.loss ?? 0} puntos
            </li>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default GenericRules;
