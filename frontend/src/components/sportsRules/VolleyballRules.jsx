import {
  Box,
  Typography,
  TextField,
  Checkbox,
  FormControlLabel,
} from "@mui/material";

const VolleyballRules = ({ rules, editable = false, onChange }) => {
  const handleChange = (field, value) => {
    if (!editable || !onChange) return;
    onChange({ ...rules, [field]: value });
  };

  return (
    <Box className="space-y-2">
      {editable ? (
        <>
          <TextField
            label="Sets para ganar"
            type="number"
            value={rules.setsToWin}
            onChange={(e) => handleChange("setsToWin", e.target.value)}
            fullWidth
          />
          <TextField
            label="Jugadores en campo"
            type="number"
            value={rules.playersOnField}
            onChange={(e) => handleChange("playersOnField", e.target.value)}
            fullWidth
          />

          <Typography fontWeight="bold">Puntos por set:</Typography>
          <TextField
            label="Set regular"
            type="number"
            value={rules.sets.regularSetPoints}
            onChange={(e) =>
              handleChange("sets", {
                ...rules.sets,
                regularSetPoints: e.target.value,
              })
            }
            fullWidth
          />
          <TextField
            label="Último set"
            type="number"
            value={rules.sets.lastSetPoints}
            onChange={(e) =>
              handleChange("sets", {
                ...rules.sets,
                lastSetPoints: e.target.value,
              })
            }
            fullWidth
          />
          <TextField
            label="Diferencia mínima"
            type="number"
            value={rules.sets.minDifference}
            onChange={(e) =>
              handleChange("sets", {
                ...rules.sets,
                minDifference: e.target.value,
              })
            }
            fullWidth
          />

          <Typography fontWeight="bold">Puntaje por resultado:</Typography>
          <TextField
            label="Victoria 3-0 o 3-1"
            type="number"
            value={rules.scoring.win3_0_or_3_1}
            onChange={(e) =>
              handleChange("scoring", {
                ...rules.scoring,
                win3_0_or_3_1: e.target.value,
              })
            }
            fullWidth
          />
          <TextField
            label="Victoria 3-2"
            type="number"
            value={rules.scoring.win3_2}
            onChange={(e) =>
              handleChange("scoring", {
                ...rules.scoring,
                win3_2: e.target.value,
              })
            }
            fullWidth
          />
          <TextField
            label="Derrota 2-3"
            type="number"
            value={rules.scoring.loss2_3}
            onChange={(e) =>
              handleChange("scoring", {
                ...rules.scoring,
                loss2_3: e.target.value,
              })
            }
            fullWidth
          />
          <TextField
            label="Derrota 1-3 o 0-3"
            type="number"
            value={rules.scoring.loss1_3_or_0_3}
            onChange={(e) =>
              handleChange("scoring", {
                ...rules.scoring,
                loss1_3_or_0_3: e.target.value,
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
        <>
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
              <strong>Diferencia mínima:</strong> {rules.sets.minDifference}{" "}
              puntos
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
        </>
      )}
    </Box>
  );
};

export default VolleyballRules;
