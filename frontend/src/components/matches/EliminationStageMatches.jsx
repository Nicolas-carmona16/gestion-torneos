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
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MatchItem from "./MatchItem";
import EliminationStage from "../pairings/EliminationStage";
import { translateRoundName } from "../../utils/translations";

const EliminationStageMatches = ({
  bracket,
  user,
  onEditClick,
  onAddSeriesGame,
  scorersData,
}) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Ordenar goleadores por totalGoals (de mayor a menor) y tomar solo los primeros 10
  const topScorers = scorersData?.scorers
    ?.sort((a, b) => b.totalGoals - a.totalGoals)
    .slice(0, 10);

  if (!bracket || Object.keys(bracket).length === 0) {
    return <Typography sx={{ mt: 2 }}>No hay partidos programados</Typography>;
  }

  return (
    <Box sx={{ width: "100%" }}>
      <Tabs value={activeTab} onChange={handleTabChange} centered>
        <Tab label="Vista por Rondas" />
        <Tab label="Vista de Bracket" />
        <Tab label="Goleadores" />
      </Tabs>

      {activeTab === 0 ? (
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
                  onAddSeriesGame={onAddSeriesGame}
                  isElimination={true}
                />
              ))}
            </AccordionDetails>
          </Accordion>
        ))
      ) : activeTab === 1 ? (
        <EliminationStage
          user={user}
          bracket={bracket}
          generatingBracket={false}
          generationError={null}
          onGenerateBracket={() => {}}
        />
      ) : (
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
    </Box>
  );
};

export default EliminationStageMatches;
