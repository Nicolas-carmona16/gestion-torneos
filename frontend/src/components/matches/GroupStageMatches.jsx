import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Chip,
  Box,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MatchItem from "./MatchItem";
import { useState } from "react";

const GroupStageMatches = ({
  matchdaysArray,
  user,
  onEditClick,
  scorersData,
  refreshScorersData,
}) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Ordenar goleadores por totalGoals (de mayor a menor) y tomar solo los primeros 10
  const topScorers = scorersData?.scorers
    ?.sort((a, b) => b.totalGoals - a.totalGoals)
    .slice(0, 10);

  if (matchdaysArray.length === 0) {
    return <Typography>No hay jornadas programadas</Typography>;
  }

  return (
    <Box sx={{ width: "100%" }}>
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        indicatorColor="primary"
        textColor="primary"
        centered
        sx={{ mb: 2 }}
      >
        <Tab label="Jornadas" />
        <Tab label="Goleadores" />
      </Tabs>

      {activeTab === 0 ? (
        matchdaysArray.map(({ matchday, matches }) => (
          <Accordion
            key={matchday}
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
                <Typography fontWeight="bold">Jornada {matchday}</Typography>
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
                  isElimination={false}
                  refreshScorersData={refreshScorersData}
                />
              ))}
            </AccordionDetails>
          </Accordion>
        ))
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

export default GroupStageMatches;
