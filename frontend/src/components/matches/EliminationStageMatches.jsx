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
}) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (!bracket || Object.keys(bracket).length === 0) {
    return <Typography sx={{ mt: 2 }}>No hay partidos programados</Typography>;
  }

  return (
    <Box sx={{ width: "100%" }}>
      <Tabs value={activeTab} onChange={handleTabChange} centered>
        <Tab label="Vista por Rondas" />
        <Tab label="Vista de Bracket" />
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
      ) : (
        <EliminationStage
          user={user}
          bracket={bracket}
          generatingBracket={false}
          generationError={null}
          onGenerateBracket={() => {}}
        />
      )}
    </Box>
  );
};

export default EliminationStageMatches;
