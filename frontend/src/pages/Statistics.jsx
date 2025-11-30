/**
 * @fileoverview Statistics page with interactive dashboard for admin users
 * @module pages/Statistics
 */

import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
} from "@mui/material";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  getDashboardStats,
  getTournamentStats,
  getParticipationStats,
  getSportsStats,
  getActivityStats,
} from "../services/statisticsService";
import {
  EmojiEvents,
  Groups,
  Person,
  SportsScore,
  TrendingUp,
} from "@mui/icons-material";

const COLORS = [
  "#026937",
  "#0d8a4c",
  "#14a559",
  "#1ec16e",
  "#4caf50",
  "#66bb6a",
  "#81c784",
  "#a5d6a7",
];

/**
 * Statistics Dashboard Component
 */
const Statistics = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for different statistics
  const [dashboardStats, setDashboardStats] = useState(null);
  const [tournamentStats, setTournamentStats] = useState(null);
  const [participationStats, setParticipationStats] = useState(null);
  const [sportsStats, setSportsStats] = useState(null);
  const [activityStats, setActivityStats] = useState(null);

  useEffect(() => {
    fetchAllStats();
  }, []);

  const fetchAllStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const [dashboard, tournaments, participation, sports, activity] =
        await Promise.all([
          getDashboardStats(),
          getTournamentStats(),
          getParticipationStats(),
          getSportsStats(),
          getActivityStats(),
        ]);

      setDashboardStats(dashboard);
      setTournamentStats(tournaments);
      setParticipationStats(participation);
      setSportsStats(sports);
      setActivityStats(activity);
    } catch (err) {
      setError("Error al cargar las estadísticas: " + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography
        variant="h4"
        gutterBottom
        fontWeight="bold"
        color="#026937"
        align="center"
      >
        Panel de Estadísticas
      </Typography>

      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        sx={{ mb: 3 }}
        centered
        variant="fullWidth"
      >
        <Tab label="Resumen General" />
        <Tab label="Torneos" />
        <Tab label="Participación" />
        <Tab label="Deportes" />
        <Tab label="Actividad" />
      </Tabs>

      {/* Tab 0: General Dashboard */}
      {tabValue === 0 && dashboardStats && (
        <Box display="flex" justifyContent="center" width="100%">
          <Box sx={{ maxWidth: 1300, width: "100%" }}>
            {/* Overview Cards */}
            <Grid container spacing={3} justifyContent="center" sx={{ mb: 4 }}>
              {/* Card 1 */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card
                  sx={{ bgcolor: "#026937", color: "white", height: "100%" }}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1}>
                      <EmojiEvents />
                      <Typography variant="h6">Torneos</Typography>
                    </Box>
                    <Typography variant="h3" fontWeight="bold">
                      {dashboardStats.overview.totalTournaments}
                    </Typography>
                    <Typography variant="body2">Total de torneos</Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Card 2 */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card
                  sx={{ bgcolor: "#0d8a4c", color: "white", height: "100%" }}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Groups />
                      <Typography variant="h6">Equipos</Typography>
                    </Box>
                    <Typography variant="h3" fontWeight="bold">
                      {dashboardStats.overview.totalTeams}
                    </Typography>
                    <Typography variant="body2">Equipos registrados</Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Card 3 */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card
                  sx={{ bgcolor: "#14a559", color: "white", height: "100%" }}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Person />
                      <Typography variant="h6">Jugadores</Typography>
                    </Box>
                    <Typography variant="h3" fontWeight="bold">
                      {dashboardStats.overview.totalPlayers}
                    </Typography>
                    <Typography variant="body2">Jugadores únicos</Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Card 4 */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card
                  sx={{ bgcolor: "#1ec16e", color: "white", height: "100%" }}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1}>
                      <SportsScore />
                      <Typography variant="h6">Partidos</Typography>
                    </Box>
                    <Typography variant="h3" fontWeight="bold">
                      {dashboardStats.overview.totalMatches}
                    </Typography>
                    <Typography variant="body2">
                      Partidos completados
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </Box>
      )}

      {/* Tab 1: Tournament Stats */}
      {tabValue === 1 && tournamentStats && (
        <Box display="flex" justifyContent="center" width="100%">
          <Box sx={{ maxWidth: 1300, width: "100%" }}>
            <Grid container spacing={3}>
              {/* Tournaments by Sport */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper
                  sx={{
                    p: 3,
                    minHeight: 420,
                    width: 450,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Typography
                    variant="h6"
                    gutterBottom
                    fontWeight="bold"
                    textAlign="center"
                  >
                    Torneos por Deporte
                  </Typography>

                  <Box sx={{ flexGrow: 1 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={tournamentStats.tournamentsBySport.map(
                          (item) => ({
                            sport: item._id,
                            count: item.count,
                          })
                        )}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="sport" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#026937" name="Torneos" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Grid>

              {/* Tournament Format Distribution */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper
                  sx={{
                    p: 3,
                    minHeight: 420,
                    width: 650,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Typography
                    variant="h6"
                    gutterBottom
                    fontWeight="bold"
                    textAlign="center"
                  >
                    Distribución de Formatos
                  </Typography>

                  <Box sx={{ flexGrow: 1 }}>
                    <ResponsiveContainer width="100%" minHeight={350}>
                      <PieChart>
                        <Pie
                          data={tournamentStats.tournamentsByFormat.map(
                            (item) => ({
                              name:
                                item._id === "group-stage"
                                  ? "Fase de Grupos"
                                  : "Eliminación Directa",
                              value: item.count,
                            })
                          )}
                          cx="50%"
                          cy="50%"
                          outerRadius="80%"
                          labelLine
                          label={({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                          dataKey="value"
                        >
                          {tournamentStats.tournamentsByFormat.map(
                            (entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            )
                          )}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Grid>

              {/* Monthly Tournaments Trend */}
              <Grid size={{ xs: 12 }}>
                <Paper
                  sx={{
                    p: 3,
                    minHeight: 420,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Typography
                    variant="h6"
                    gutterBottom
                    fontWeight="bold"
                    textAlign="center"
                  >
                    Tendencia de Creación de Torneos (Últimos 12 meses)
                  </Typography>

                  <Box sx={{ flexGrow: 1 }}>
                    <ResponsiveContainer width="100%" height={350}>
                      <LineChart
                        data={tournamentStats.monthlyTournaments.map(
                          (item) => ({
                            month: `${item._id.month}/${item._id.year}`,
                            count: item.count,
                          })
                        )}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="count"
                          stroke="#026937"
                          strokeWidth={2}
                          name="Torneos Creados"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Grid>

              {/* Average Teams Info */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{ height: "100%", minHeight: 200 }}>
                  <CardContent sx={{ textAlign: "center", py: 4 }}>
                    <Typography variant="h6" gutterBottom>
                      Promedio de Equipos por Torneo
                    </Typography>
                    <Typography variant="h3" fontWeight="bold" color="#026937">
                      {tournamentStats.avgTeamsPerTournament.toFixed(1)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      equipos en promedio
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </Box>
      )}

      {/* Tab 2: Participation Stats */}
      {tabValue === 2 && participationStats && (
        <Box>
          <Grid container spacing={3}>
            {/* Players by Career */}
            <Grid size={{ xs: 12, lg: 6 }}>
              <Paper
                sx={{
                  p: 3,
                  height: "100%",
                  minHeight: "500px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  fontWeight="bold"
                  textAlign="center"
                >
                  Top 10 Carreras con Más Jugadores
                </Typography>
                <Box
                  sx={{
                    flexGrow: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                      data={participationStats.playersByCareer}
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="_id" type="category" width={180} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#026937" name="Jugadores" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>

            {/* Team Size Distribution */}
            <Grid size={{ xs: 12, lg: 6 }}>
              <Paper
                sx={{
                  p: 3,
                  height: "100%",
                  minHeight: "500px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  fontWeight="bold"
                  textAlign="center"
                >
                  Distribución de Tamaño de Equipos
                </Typography>
                <Box
                  sx={{
                    flexGrow: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                      data={participationStats.teamSizeDistribution}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="_id"
                        label={{
                          value: "Jugadores",
                          position: "insideBottom",
                          offset: -5,
                        }}
                      />
                      <YAxis
                        label={{
                          value: "Equipos",
                          angle: -90,
                          position: "insideLeft",
                        }}
                      />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="count"
                        fill="#0d8a4c"
                        name="Cantidad de Equipos"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>

            {/* Monthly Players Trend */}
            <Grid size={{ xs: 12 }}>
              <Paper
                sx={{
                  p: 3,
                  minHeight: "400px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  fontWeight="bold"
                  textAlign="center"
                >
                  Registros de Jugadores (Últimos 12 meses)
                </Typography>
                <Box sx={{ flexGrow: 1 }}>
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart
                      data={participationStats.monthlyPlayers.map((item) => ({
                        month: `${item._id.month}/${item._id.year}`,
                        count: item.count,
                      }))}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#14a559"
                        strokeWidth={2}
                        name="Jugadores Registrados"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>

            {/* Average Players per Team */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ height: "100%", minHeight: "200px" }}>
                <CardContent sx={{ textAlign: "center", py: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    Promedio de Jugadores por Equipo
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" color="#026937">
                    {participationStats.avgPlayersPerTeam.toFixed(1)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    jugadores en promedio
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Tab 3: Sports Stats */}
      {tabValue === 3 && sportsStats && (
        <Box>
          <Grid container spacing={3}>
            {/* Sports Popularity */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper
                sx={{
                  p: 3,
                  height: "100%",
                  minHeight: "400px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  fontWeight="bold"
                  textAlign="center"
                >
                  Popularidad de Deportes (por equipos)
                </Typography>
                <Box
                  sx={{
                    flexGrow: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={sportsStats.sportsPopularity}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="_id" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="teamCount" fill="#026937" name="Equipos" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>

            {/* Matches by Status */}
            <Grid size={{ xs: 12, md: 6 }} width={450}>
              <Paper
                sx={{
                  p: 3,
                  height: "100%",
                  minHeight: "400px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  fontWeight="bold"
                  textAlign="center"
                >
                  Partidos por Estado
                </Typography>
                <Box
                  sx={{
                    flexGrow: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sportsStats.matchesByStatus.map((item) => ({
                          name: item._id,
                          value: item.count,
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {sportsStats.matchesByStatus.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>

            {/* Top Scorers */}
            {sportsStats.topScorers.length > 0 && (
              <Grid size={{ xs: 12, lg: 6 }} width={400}>
                <Paper
                  sx={{
                    p: 3,
                    height: "100%",
                    minHeight: "500px",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Typography
                    variant="h6"
                    gutterBottom
                    fontWeight="bold"
                    textAlign="center"
                  >
                    Top 10 Goleadores
                  </Typography>
                  <Box
                    sx={{
                      flexGrow: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart
                        data={sportsStats.topScorers}
                        layout="vertical"
                        margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis
                          dataKey="playerName"
                          type="category"
                          width={150}
                        />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="totalGoals" fill="#1ec16e" name="Goles" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Grid>
            )}

            {/* Best Goalkeepers */}
            {sportsStats.bestGoalkeepers.length > 0 && (
              <Grid size={{ xs: 12, lg: 6 }} width={400}>
                <Paper
                  sx={{
                    p: 3,
                    height: "100%",
                    minHeight: "500px",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Typography
                    variant="h6"
                    gutterBottom
                    fontWeight="bold"
                    textAlign="center"
                  >
                    Mejores Porteros (Vallas Invictas)
                  </Typography>
                  <Box
                    sx={{
                      flexGrow: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart
                        data={sportsStats.bestGoalkeepers}
                        layout="vertical"
                        margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis
                          dataKey="playerName"
                          type="category"
                          width={150}
                        />
                        <Tooltip />
                        <Legend />
                        <Bar
                          dataKey="cleanSheets"
                          fill="#4caf50"
                          name="Vallas Invictas"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Grid>
            )}

            {/* Average Goals */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ height: "100%", minHeight: "200px" }}>
                <CardContent sx={{ textAlign: "center", py: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    Promedio de Goles por Partido
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" color="#026937">
                    {sportsStats.avgGoalsPerMatch.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    goles en promedio (partidos completados)
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Tab 4: Activity Stats */}
      {tabValue === 4 && activityStats && (
        <Box>
          <Grid container spacing={3}>
            {/* Recent Activity (Last 30 days) */}
            <Grid size={{ xs: 12 }} width={700}>
              <Paper
                sx={{
                  p: 3,
                  minHeight: "400px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  fontWeight="bold"
                  textAlign="center"
                >
                  Actividad Reciente (Últimos 30 días)
                </Typography>
                <Box sx={{ flexGrow: 1 }}>
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart
                      data={activityStats.recentActivity}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="_id" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#026937"
                        strokeWidth={2}
                        name="Novedades"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>

            {/* Most Active Captains */}
            <Grid size={{ xs: 12, md: 6 }} width={600}>
              <Paper
                sx={{
                  p: 3,
                  height: "100%",
                  minHeight: "400px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  fontWeight="bold"
                  textAlign="center"
                >
                  Capitanes Más Activos
                </Typography>
                <Box
                  sx={{
                    flexGrow: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={activityStats.activeCaptains}
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis
                        dataKey="captainName"
                        type="category"
                        width={150}
                      />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="teamCount" fill="#026937" name="Equipos" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}
    </Container>
  );
};

export default Statistics;

