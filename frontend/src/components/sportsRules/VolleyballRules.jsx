import {
  Box,
  Typography,
  TextField,
  Checkbox,
  FormControlLabel,
  Popover,
  IconButton,
  Tooltip,
} from "@mui/material";
import { InfoOutlined } from "@mui/icons-material";
import { useState } from "react";

const VolleyballRules = ({ rules, editable = false, onChange }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [popoverContent, setPopoverContent] = useState("");

  const handleChange = (field, value) => {
    if (!editable || !onChange) return;
    onChange({ ...rules, [field]: value });
  };

  const handlePopoverOpen = (event, content) => {
    setAnchorEl(event.currentTarget);
    setPopoverContent(content);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
    setPopoverContent("");
  };

  const open = Boolean(anchorEl);

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

          <Box style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Typography fontWeight="bold">Puntaje por resultado:</Typography>
            <Tooltip title="Ver explicación del sistema de puntaje">
              <IconButton
                size="small"
                onClick={(e) =>
                  handlePopoverOpen(
                    e,
                    `Sistema de Puntuación:

Victoria dominante (diferencia de 2 sets o más)
• Ejemplos: ${rules.setsToWin}-0, ${rules.setsToWin}-${Math.max(
                      0,
                      rules.setsToWin - 2
                    )}

Victoria ajustada (diferencia de 1 set)
• Ejemplo: ${rules.setsToWin}-${rules.setsToWin - 1}

Derrota ajustada (pérdida por 1 set)
• Ejemplo: ${rules.setsToWin - 1}-${rules.setsToWin}

Derrota dominante (pérdida por 2 sets o más)
• Ejemplos: 0-${rules.setsToWin}, ${Math.max(0, rules.setsToWin - 2)}-${
                      rules.setsToWin
                    }`
                  )
                }
                sx={{ padding: "2px" }}
              >
                <InfoOutlined fontSize="small" color="primary" />
              </IconButton>
            </Tooltip>
          </Box>
          <TextField
            label="Victoria dominante"
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
            label="Victoria ajustada"
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
            label="Derrota ajustada"
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
            label="Derrota dominante"
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
          <Box style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Typography className="text-gray-700 text-sm">
              <strong>Puntaje por resultado:</strong>
            </Typography>
            <Tooltip title="Ver explicación del sistema de puntaje">
              <IconButton
                size="small"
                onClick={(e) =>
                  handlePopoverOpen(
                    e,
                    `¿Cómo se asignan los puntos?
Victoria dominante (${rules.setsToWin}-0 o ${rules.setsToWin}-${Math.max(
                      0,
                      rules.setsToWin - 2
                    )}): ${rules.scoring.win3_0_or_3_1} puntos
Victoria ajustada (${rules.setsToWin}-${rules.setsToWin - 1}): ${
                      rules.scoring.win3_2
                    } puntos
Derrota ajustada (${rules.setsToWin - 1}-${rules.setsToWin}): ${
                      rules.scoring.loss2_3
                    } puntos
Derrota dominante (0-${rules.setsToWin} o ${Math.max(0, rules.setsToWin - 2)}-${
                      rules.setsToWin
                    }): ${rules.scoring.loss1_3_or_0_3} puntos`
                  )
                }
                sx={{ padding: "2px" }}
              >
                <InfoOutlined fontSize="small" color="primary" />
              </IconButton>
            </Tooltip>
          </Box>
          <Box component="ul">
            <li>
              <strong>Victoria dominante:</strong> {rules.scoring.win3_0_or_3_1}{" "}
              puntos
            </li>
            <li>
              <strong>Victoria ajustada:</strong> {rules.scoring.win3_2} puntos
            </li>
            <li>
              <strong>Derrota ajustada:</strong> {rules.scoring.loss2_3} puntos
            </li>
            <li>
              <strong>Derrota dominante:</strong> {rules.scoring.loss1_3_or_0_3}{" "}
              puntos
            </li>
          </Box>
          <Typography className="text-gray-700 text-sm">
            <strong>Empate:</strong> {rules.draw ? "Permitido" : "No permitido"}
          </Typography>
        </>
      )}

      {/* Popover para explicaciones */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        sx={{
          "& .MuiPopover-paper": {
            maxWidth: 400,
            padding: 2,
          },
        }}
      >
        <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
          {popoverContent}
        </Typography>
      </Popover>
    </Box>
  );
};

export default VolleyballRules;
