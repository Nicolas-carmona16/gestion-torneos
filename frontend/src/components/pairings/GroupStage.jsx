import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Button,
  CircularProgress,
} from "@mui/material";

const GroupStage = ({
  standings,
  teamsAdvancing,
  onGenerateGroups,
  generatingGroups,
  generationError,
  user,
}) => {
  if (Object.keys(standings).length === 0) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
        <Typography>Aún no se han generado grupos para este torneo</Typography>
        {!user?.role || user.role !== "admin" ? null : (
          <Button
            variant="contained"
            color="primary"
            onClick={onGenerateGroups}
            disabled={generatingGroups}
          >
            {generatingGroups ? (
              <>
                <CircularProgress size={24} color="inherit" />
                <Box ml={2}>Generando grupos...</Box>
              </>
            ) : (
              "Generar Grupos"
            )}
          </Button>
        )}
        {generationError && (
          <Typography color="error" mt={2}>
            {generationError}
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Tabla de Posiciones - Fase de Grupos
      </Typography>

      {Object.entries(standings).map(([groupName, teams]) => (
        <Box key={groupName} mb={4}>
          <Typography variant="h6" gutterBottom>
            Grupo {groupName}
            <Chip
              label={`Clasifican ${teamsAdvancing} equipos`}
              size="small"
              sx={{ ml: 2 }}
              color="primary"
            />
          </Typography>
          <Paper elevation={3}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Posición</TableCell>
                  <TableCell>Equipo</TableCell>
                  <TableCell align="right">PJ</TableCell>
                  <TableCell align="right">PG</TableCell>
                  <TableCell align="right">PE</TableCell>
                  <TableCell align="right">PP</TableCell>
                  <TableCell align="right">GF</TableCell>
                  <TableCell align="right">GC</TableCell>
                  <TableCell align="right">DG</TableCell>
                  <TableCell align="right">Pts</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {teams.map((team, index) => (
                  <TableRow
                    key={team.team._id || index}
                    sx={{
                      backgroundColor:
                        index < teamsAdvancing
                          ? "rgba(0, 200, 0, 0.1)"
                          : "inherit",
                      "&:hover": { backgroundColor: "action.hover" },
                    }}
                  >
                    <TableCell>
                      {index + 1}
                      {index < teamsAdvancing}
                    </TableCell>
                    <TableCell>
                      {typeof team.team === "object" ? (
                        team.team.name
                      ) : (
                        <Typography color="textSecondary">
                          Equipo no encontrado
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">{team.played}</TableCell>
                    <TableCell align="right">{team.wins}</TableCell>
                    <TableCell align="right">{team.draws}</TableCell>
                    <TableCell align="right">{team.losses}</TableCell>
                    <TableCell align="right">{team.goalsFor}</TableCell>
                    <TableCell align="right">{team.goalsAgainst}</TableCell>
                    <TableCell align="right">
                      {team.goalsFor - team.goalsAgainst}
                    </TableCell>
                    <TableCell align="right">
                      <strong>{team.points}</strong>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Box>
      ))}
    </Box>
  );
};

export default GroupStage;
