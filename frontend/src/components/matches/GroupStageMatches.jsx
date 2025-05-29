import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Chip,
  Box,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MatchItem from "./MatchItem";

const GroupStageMatches = ({ matchdaysArray, user, onEditClick }) => {
  if (matchdaysArray.length === 0) {
    return <Typography>No hay jornadas programadas</Typography>;
  }

  return (
    <>
      {matchdaysArray.map(({ matchday, matches }) => (
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
              />
            ))}
          </AccordionDetails>
        </Accordion>
      ))}
    </>
  );
};

export default GroupStageMatches;
