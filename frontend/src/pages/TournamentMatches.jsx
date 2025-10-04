import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getMatchesByMatchday,
  updateMatchResult,
  checkPlayoffStatus,
} from "../services/groupStageService";
import {
  getEliminationBracket,
  addSeriesGameResult,
} from "../services/eliminationStageService";
import { getUser } from "../services/authService";
import { getTournamentById } from "../services/tournamentService";
import {
  Paper,
  Typography,
  CircularProgress,
  Box,
  Tabs,
  Tab,
  Alert,
} from "@mui/material";
import GroupStageMatches from "../components/matches/GroupStageMatches";
import EliminationStageMatches from "../components/matches/EliminationStageMatches";
import EditMatchDialog from "../components/matches/EditMatchDialog";
import SeriesGameDialog from "../components/matches/SeriesGameDialog";
import {
  getTournamentScorers,
  isScorersSupported,
} from "../services/scorersService";
import {
  getTournamentGoalkeepers,
  isGoalkeepersSupported,
} from "../services/goalkeepersService";

const TournamentMatches = () => {
  const { tournamentId } = useParams();
  const [matchesByMatchday, setMatchesByMatchday] = useState({});
  const [bracket, setBracket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingMatch, setEditingMatch] = useState(null);
  const [editFormData, setEditFormData] = useState({
    scoreTeam1: "",
    scoreTeam2: "",
    date: "",
    time: "",
    description: "",
  });
  const [user, setUser] = useState(null);
  const [tournament, setTournament] = useState(null);
  const [editingSeriesGame, setEditingSeriesGame] = useState(null);
  const [seriesGameFormData, setSeriesGameFormData] = useState({
    scoreTeam1: "",
    scoreTeam2: "",
  });
  const [scorersData, setScorersData] = useState(null);
  const [goalkeepersData, setGoalkeepersData] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [playoffStatus, setPlayoffStatus] = useState(null);
  const [playoffBracket, setPlayoffBracket] = useState(null);
  const [loadingPlayoffBracket, setLoadingPlayoffBracket] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [tournamentData, userData] = await Promise.all([
          getTournamentById(tournamentId),
          getUser(),
        ]);
        setTournament(tournamentData);
        setUser(userData);

        const supportsScorers = isScorersSupported(tournamentData.sport?.name);
        const supportsGoalkeepers = isGoalkeepersSupported(tournamentData.sport?.name);

        if (tournamentData.format === "group-stage") {
          const promises = [getMatchesByMatchday(tournamentId)];
          
          if (supportsScorers) {
            promises.push(getTournamentScorers(tournamentId));
          }
          
          if (supportsGoalkeepers) {
            promises.push(getTournamentGoalkeepers(tournamentId));
          }

          const results = await Promise.all(promises);
          setMatchesByMatchday(results[0]);
          
          let scorersIndex = 1;
          let goalkeepersIndex = supportsScorers ? 2 : 1;
          
          setScorersData(supportsScorers ? results[scorersIndex] : null);
          setGoalkeepersData(supportsGoalkeepers ? results[goalkeepersIndex] : null);

          try {
            const playoff = await checkPlayoffStatus(tournamentId);
            setPlayoffStatus(playoff);

            if (playoff.hasPlayoff) {
              setLoadingPlayoffBracket(true);
              try {
                const bracketData = await getEliminationBracket(tournamentId);
                setPlayoffBracket(bracketData);
              } catch (error) {
                console.error("Error cargando bracket del playoff:", error);
              } finally {
                setLoadingPlayoffBracket(false);
              }
            }
          } catch (error) {
            console.error("Error verificando estado del playoff:", error);
          }
        } else if (tournamentData.format === "elimination") {
          const promises = [getEliminationBracket(tournamentId)];

          if (supportsScorers) {
            promises.push(getTournamentScorers(tournamentId));
          }
          
          if (supportsGoalkeepers) {
            promises.push(getTournamentGoalkeepers(tournamentId));
          }

          const results = await Promise.all(promises);
          setBracket(results[0] || {});
          
          let scorersIndex = 1;
          let goalkeepersIndex = supportsScorers ? 2 : 1;
          
          setScorersData(supportsScorers ? results[scorersIndex] : null);
          setGoalkeepersData(supportsGoalkeepers ? results[goalkeepersIndex] : null);
        }
      } catch (err) {
        setError("Error al cargar los datos del torneo");
        console.error("Error details:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tournamentId]);

  const handleAddSeriesGameClick = (match) => {
    setEditingMatch(match);
    setEditingSeriesGame(-1);
    setSeriesGameFormData({
      scoreTeam1: "",
      scoreTeam2: "",
    });
  };

  const handleUpdateSeriesGame = async () => {
    try {
      const { scoreTeam1, scoreTeam2 } = seriesGameFormData;

      if (scoreTeam1 === "" || scoreTeam2 === "") {
        throw new Error("Los scores no pueden estar vacíos");
      }

      await addSeriesGameResult(editingMatch._id, {
        scoreTeam1: parseInt(scoreTeam1),
        scoreTeam2: parseInt(scoreTeam2),
      });

      if (tournament.format === "elimination") {
        const freshBracket = await getEliminationBracket(tournamentId);
        setBracket(freshBracket || {});
      } else if (playoffBracket) {
        const freshPlayoffBracket = await getEliminationBracket(tournamentId);
        setPlayoffBracket(freshPlayoffBracket || {});
      }

      if (typeof refreshScorersData === "function") {
        await refreshScorersData();
      }
      
      if (typeof refreshGoalkeepersData === "function") {
        await refreshGoalkeepersData();
      }
      
      setEditingMatch(null);
      setEditingSeriesGame(null);
    } catch (error) {
      console.error("Error updating series game:", error);
      setError(error.message || "Error al actualizar el juego de la serie");
    }
  };

  const handleEditClick = (match) => {
    setEditingMatch(match);
    setEditFormData({
      scoreTeam1: match.scoreTeam1 || "",
      scoreTeam2: match.scoreTeam2 || "",
      date: match.date ? match.date.split("T")[0] : "",
      time: match.time || "",
      description: match.description || "",
    });
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value,
    });
  };

  const handleUpdateMatch = async (matchId, updateData) => {
    try {
      await updateMatchResult(matchId, updateData);

      // Refrescar datos según el formato del torneo
      if (tournament.format === "group-stage") {
        const freshMatches = await getMatchesByMatchday(tournamentId);
        setMatchesByMatchday(freshMatches);
      } else if (tournament.format === "elimination") {
        const freshBracket = await getEliminationBracket(tournamentId);
        setBracket(freshBracket || {});
      }

      if (playoffBracket) {
        const freshPlayoffBracket = await getEliminationBracket(tournamentId);
        setPlayoffBracket(freshPlayoffBracket || {});
      }

      if (typeof refreshScorersData === "function") {
        await refreshScorersData();
      }
      
      if (typeof refreshGoalkeepersData === "function") {
        await refreshGoalkeepersData();
      }
    } catch (error) {
      console.error("Error al actualizar el partido:", error);
      setError("Error al actualizar el partido");
    }
  };

  const handleUpdateMatchFromDialog = async () => {
    try {
      const updateData = Object.fromEntries(
        Object.entries(editFormData).filter(
          ([key, value]) => value !== "" && value !== editingMatch[key]
        )
      );

      if (Object.keys(updateData).length > 0) {
        await handleUpdateMatch(editingMatch._id, updateData);
        setEditingMatch(null);
      }
    } catch (error) {
      console.error("Error al actualizar el partido:", error);
      setError("Error al actualizar el partido");
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const matchdaysArray = Object.entries(matchesByMatchday).map(
    ([matchdayNumber, matches]) => ({
      matchday: matchdayNumber,
      matches,
    })
  );

  const refreshScorersData = async () => {
    try {
      if (tournament && isScorersSupported(tournament.sport?.name)) {
        const scorers = await getTournamentScorers(tournamentId);
        setScorersData(scorers);
      }
    } catch (err) {
      console.error("Error al refrescar la tabla de goleadores:", err);
    }
  };

  const refreshGoalkeepersData = async () => {
    try {
      if (tournament && isGoalkeepersSupported(tournament.sport?.name)) {
        const goalkeepers = await getTournamentGoalkeepers(tournamentId);
        setGoalkeepersData(goalkeepers);
      }
    } catch (err) {
      console.error("Error al refrescar la tabla de porteros:", err);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!tournament) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <Typography>Torneo no encontrado</Typography>
      </Box>
    );
  }

  const showPlayoffTab =
    tournament.format === "group-stage" && playoffStatus?.hasPlayoff;
  const tabs = [
    {
      label:
        tournament.format === "group-stage" ? "Fase de Grupos" : "Partidos",
      value: 0,
    },
    ...(showPlayoffTab ? [{ label: "Eliminación Directa", value: 1 }] : []),
  ];

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 4, ml: 5, mr: 5 }}>
      <Typography
        variant="h4"
        gutterBottom
        align="center"
        color="primary"
        fontWeight="bold"
      >
        Programación del Torneo: {tournament.name}
      </Typography>

      {showPlayoffTab && (
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            centered
            indicatorColor="primary"
            textColor="primary"
          >
            {tabs.map((tab) => (
              <Tab key={tab.value} label={tab.label} />
            ))}
          </Tabs>
        </Box>
      )}

      {activeTab === 0 && (
        <>
          {tournament.format === "group-stage" ? (
            <GroupStageMatches
              matchdaysArray={matchdaysArray}
              user={user}
              onEditClick={handleEditClick}
              onUpdateMatch={handleUpdateMatch}
              scorersData={scorersData}
              goalkeepersData={goalkeepersData}
              refreshScorersData={refreshScorersData}
              refreshGoalkeepersData={refreshGoalkeepersData}
              sportName={tournament.sport?.name}
            />
          ) : (
            <EliminationStageMatches
              bracket={bracket}
              user={user}
              onEditClick={handleEditClick}
              onUpdateMatch={handleUpdateMatch}
              onAddSeriesGame={handleAddSeriesGameClick}
              scorersData={scorersData}
              goalkeepersData={goalkeepersData}
              refreshScorersData={refreshScorersData}
              refreshGoalkeepersData={refreshGoalkeepersData}
              sportName={tournament.sport?.name}
            />
          )}
        </>
      )}

      {activeTab === 1 && showPlayoffTab && (
        <Box>
          {loadingPlayoffBracket ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : playoffBracket ? (
            <EliminationStageMatches
              bracket={playoffBracket}
              user={user}
              onEditClick={handleEditClick}
              onUpdateMatch={handleUpdateMatch}
              onAddSeriesGame={handleAddSeriesGameClick}
              scorersData={scorersData}
              goalkeepersData={goalkeepersData}
              refreshScorersData={refreshScorersData}
              refreshGoalkeepersData={refreshGoalkeepersData}
              sportName={tournament.sport?.name}
              isPlayoff={true}
            />
          ) : (
            <Alert severity="error">
              No se pudo cargar el bracket de eliminacion directa
            </Alert>
          )}
        </Box>
      )}

      <EditMatchDialog
        open={editingMatch !== null && editingSeriesGame === null}
        onClose={() => setEditingMatch(null)}
        match={editingMatch}
        tournamentFormat={tournament?.format}
        formData={editFormData}
        onFormChange={handleEditFormChange}
        onSubmit={handleUpdateMatchFromDialog}
      />

      <SeriesGameDialog
        open={editingSeriesGame !== null}
        onClose={() => {
          setEditingMatch(null);
          setEditingSeriesGame(null);
        }}
        match={editingMatch}
        formData={seriesGameFormData}
        onFormChange={(e) =>
          setSeriesGameFormData({
            ...seriesGameFormData,
            [e.target.name]: e.target.value,
          })
        }
        onSubmit={handleUpdateSeriesGame}
      />
    </Paper>
  );
};

export default TournamentMatches;
