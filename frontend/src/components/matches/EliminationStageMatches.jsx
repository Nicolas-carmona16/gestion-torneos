import { useState } from "react";
import {
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Chip,
  Box,
  TableContainer,
  Table,
  TableCell,
  TableHead,
  TableBody,
  TableRow,
  Paper,
  Tooltip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MatchItem from "./MatchItem";
import { translateRoundName } from "../../utils/translations";
import { isScorersSupported } from "../../services/scorersService";
import { isGoalkeepersSupported } from "../../services/goalkeepersService";

const EliminationStageMatches = ({
  bracket,
  user,
  onEditClick,
  onUpdateMatch,
  onAddSeriesGame,
  scorersData,
  goalkeepersData,
  refreshScorersData,
  refreshGoalkeepersData,
  sportName,
  isPlayoff = false,
}) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const supportsScorers = isScorersSupported(sportName);
  const supportsGoalkeepers = isGoalkeepersSupported(sportName);

  const topScorers = scorersData?.scorers
    ?.sort((a, b) => b.totalGoals - a.totalGoals)
    .slice(0, 10);

  const topGoalkeepers = goalkeepersData?.goalkeepers
    ?.sort((a, b) => a.average - b.average)
    .slice(0, 10);

  if (!bracket || Object.keys(bracket).length === 0) {
    return (
      <Typography sx={{ mt: 2 }}>
        {isPlayoff
          ? "No hay partidos de eliminación directa programados"
          : "No hay partidos programados"}
      </Typography>
    );
  }

  // Dynamic tabs based on sport support
  const tabs = [{ label: "Vista por Rondas", value: 0 }];
  
  if (supportsScorers) {
    tabs.push({ label: "Goleadores", value: 1 });
  }
  
  if (supportsGoalkeepers) {
    tabs.push({ 
      label: "Valla Menos Vencida", 
      value: supportsScorers ? 2 : 1 
    });
  }

  return (
    <Box sx={{ width: "100%" }}>
      {(supportsScorers || supportsGoalkeepers) ? (
        <Tabs value={activeTab} onChange={handleTabChange} centered>
          {tabs.map((tab) => (
            <Tab key={tab.value} label={tab.label} />
          ))}
        </Tabs>
      ) : (
        <Typography variant="h6" sx={{ mb: 2, textAlign: "center" }}>
          Vista por Rondas
        </Typography>
      )}

      {/* Tab Content */}
      {activeTab === 0 && (
        Object.entries(bracket).map(([roundName, matches]) => (
          <Accordion
            key={roundName}
            sx={{
              mb: 2,
              borderRadius: 2,
              boxShadow: 2,
              "&:before": {
                display: "none",
              },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                bgcolor: "#f5f5f5",
                borderRadius: "8px 8px 0 0",
                "& .MuiTypography-root": { fontWeight: "bold" },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography fontWeight="bold">
                  {translateRoundName(roundName)}
                </Typography>
                <Chip
                  label={`${matches.length} partidos`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {matches.map((match) => (
                <MatchItem
                  key={match._id}
                  match={match}
                  user={user}
                  onEditClick={onEditClick}
                  onUpdateMatch={onUpdateMatch}
                  onAddSeriesGame={onAddSeriesGame}
                  isElimination={true}
                  refreshScorersData={refreshScorersData}
                  refreshGoalkeepersData={refreshGoalkeepersData}
                />
              ))}
            </AccordionDetails>
          </Accordion>
        ))
      )}

      {/* Tabla de Goleadores */}
      {activeTab === 1 && supportsScorers && (
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Tabla de Goleadores - {scorersData?.tournament?.name}
          </Typography>

          {topScorers?.length > 0 ? (
            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                    <TableCell>#</TableCell>
                    <TableCell>Jugador</TableCell>
                    <TableCell>Equipo</TableCell>
                    <TableCell align="center">Goles</TableCell>
                    <TableCell align="center">Partidos</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topScorers.map((scorer, index) => (
                    <TableRow
                      key={scorer.player._id}
                      sx={{
                        "&:nth-of-type(1)": {
                          bgcolor: "rgba(0, 200, 0, 0.1)",
                          fontWeight: "bold",
                        },
                        "&:hover": {
                          bgcolor: "action.hover",
                        },
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Typography>{index + 1}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          {scorer.player.fullName}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          {scorer.team.name}
                        </Box>
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: "bold" }}>
                        {scorer.totalGoals}
                      </TableCell>
                      <TableCell align="center">{scorer.matches}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography>No hay datos de goleadores disponibles</Typography>
          )}
        </Box>
      )}

      {/* Tabla de Valla Menos Vencida */}
      {((activeTab === 2 && supportsScorers && supportsGoalkeepers) || 
        (activeTab === 1 && !supportsScorers && supportsGoalkeepers)) && (
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Valla Menos Vencida - {goalkeepersData?.tournament?.name}
          </Typography>

          {topGoalkeepers?.length > 0 ? (
            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                    <TableCell>#</TableCell>
                    <TableCell>Portero</TableCell>
                    <TableCell>Equipo</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Partidos Jugados" arrow>
                        <span>PJ</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Goles Recibidos" arrow>
                        <span>GR</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Vallas Invictas" arrow>
                        <span>VI</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Promedio de goles recibidos por partido" arrow>
                        <span>Promedio</span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topGoalkeepers.map((goalkeeper, index) => (
                    <TableRow
                      key={goalkeeper.player._id}
                      sx={{
                        "&:nth-of-type(1)": {
                          bgcolor: "rgba(0, 200, 0, 0.1)",
                          fontWeight: "bold",
                        },
                        "&:hover": {
                          bgcolor: "action.hover",
                        },
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Typography>{index + 1}</Typography>
                          {index === 0}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          {goalkeeper.player.fullName}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          {goalkeeper.team.name}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        {goalkeeper.gamesPlayed}
                      </TableCell>
                      <TableCell align="center" sx={{ color: "error.main" }}>
                        {goalkeeper.goalsAgainst}
                      </TableCell>
                      <TableCell align="center" sx={{ color: "success.main", fontWeight: "bold" }}>
                        {goalkeeper.cleanSheets}
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: "bold" }}>
                        {goalkeeper.average}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography>No hay datos de porteros disponibles</Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default EliminationStageMatches;
