import React, { useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Handle,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

// Componente personalizado para los nodos de match
const MatchNode = ({ data }) => {
  const { match } = data;

  const getWinnerStyle = (teamId) => {
    if (!match.seriesWinner) return {};
    return match.seriesWinner._id === teamId
      ? {
          fontWeight: "bold",
          color: "#2e7d32",
          backgroundColor: "#e8f5e9",
        }
      : {
          opacity: 0.6,
        };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "#4caf50";
      case "in-progress":
        return "#ff9800";
      case "postponed":
      case "cancelled":
        return "#f44336";
      case "walkover":
        return "#2196f3";
      default:
        return "#9e9e9e";
    }
  };

  const translateStatus = (status) => {
    switch (status) {
      case "scheduled":
        return "Programado";
      case "pending":
        return "Pendiente";
      case "in-progress":
        return "En progreso";
      case "completed":
        return "Completado";
      case "postponed":
        return "Aplazado";
      case "cancelled":
        return "Cancelado";
      case "walkover":
        return "Walkover";
      default:
        return status;
    }
  };

  return (
    <>
      <Handle type="source" position="right" id="right" />
      <Handle type="target" position="left" id="left" />
      <TableContainer
        component={Paper}
        sx={{
          border: `2px solid ${getStatusColor(match.status)}`,
          borderRadius: 2,
          width: 450,
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center">
                <strong>Equipo</strong>
              </TableCell>
              {match.seriesMatches?.map((_, index) => (
                <TableCell key={index} align="center">
                  <strong>Juego {index + 1}</strong>
                </TableCell>
              ))}
              <TableCell align="center">
                <strong>Resultado Global</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell
                align="center"
                sx={{ ...getWinnerStyle(match.team1?._id) }}
              >
                {match.team1?.name || "Por definir"}
              </TableCell>
              {match.seriesMatches?.map((game) => (
                <TableCell key={game._id} align="center">
                  {game.scoreTeam1 ?? "-"}
                </TableCell>
              ))}
              <TableCell align="center">
                {match.status === "completed" || match.status === "in-progress"
                  ? match.scoreTeam1
                  : "Pendiente"}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell
                align="center"
                sx={{ ...getWinnerStyle(match.team2?._id) }}
              >
                {match.team2?.name || "Por definir"}
              </TableCell>
              {match.seriesMatches?.map((game) => (
                <TableCell key={game._id} align="center">
                  {game.scoreTeam2 ?? "-"}
                </TableCell>
              ))}
              <TableCell align="center">
                {match.status === "completed" || match.status === "in-progress"
                  ? match.scoreTeam2
                  : "Pendiente"}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <Typography
          variant="caption"
          textAlign="center"
          display="block"
          mt={1}
          sx={{ color: getStatusColor(match.status) }}
        >
          {translateStatus(match.status)}
        </Typography>
      </TableContainer>
    </>
  );
};

const nodeTypes = {
  match: MatchNode,
};

const EliminationStage = ({
  user,
  onGenerateBracket,
  generatingBracket,
  generationError,
  bracket,
}) => {
  const { nodes, edges } = useMemo(() => {
    if (!bracket || Object.keys(bracket).length === 0) {
      return { nodes: [], edges: [] };
    }

    const nodes = [];
    const edges = [];
    const roundOrder = [
      "round-of-32",
      "round-of-16",
      "quarter-finals",
      "semi-finals",
      "final",
    ];

    const existingRounds = roundOrder.filter((round) => bracket[round]);
    let nodeId = 0;
    const bracketIdMap = {}; // Mapeo de bracketId a nodeId

    // Primera pasada: crear todos los nodos
    existingRounds.forEach((round, roundIndex) => {
      const matches = bracket[round] || [];
      const roundX = roundIndex * 500;
      const verticalSpacing = 250;

      // Calcular posición vertical centrada
      const totalHeight = (matches.length - 1) * verticalSpacing;
      const startY = -totalHeight / 2;

      matches.forEach((match, matchIndex) => {
        const id = `node-${nodeId++}`;
        const y = startY + matchIndex * verticalSpacing;

        nodes.push({
          id,
          type: "match",
          position: { x: roundX, y },
          data: { match, round },
          style: { width: 450 },
          draggable: false,
          selectable: false,
          connectable: false,
        });

        // Mapear bracketId a nodeId si existe
        if (match.bracketId) {
          bracketIdMap[match.bracketId] = id;
        }
      });
    });

    // Segunda pasada: crear las conexiones
    existingRounds.forEach((round, roundIndex) => {
      if (roundIndex === 0) return; // La primera ronda no tiene predecesores

      const matches = bracket[round] || [];
      const prevRound = existingRounds[roundIndex - 1];
      const prevMatches = bracket[prevRound] || [];

      matches.forEach((match) => {
        // Encontrar todos los matches de la ronda anterior que apuntan a este match
        const sources = prevMatches.filter(
          (prevMatch) => prevMatch.nextMatchBracketId === match.bracketId
        );

        sources.forEach((sourceMatch) => {
          const sourceId = bracketIdMap[sourceMatch.bracketId];
          const targetId = bracketIdMap[match.bracketId];

          if (sourceId && targetId) {
            edges.push({
              id: `edge-${sourceId}-${targetId}`,
              source: sourceId,
              target: targetId,
              sourceHandle: "right", // Debe coincidir con el ID del Handle de origen
              targetHandle: "left", // Debe coincidir con el ID del Handle de destino
              type: "smoothstep",
              animated: true,
              style: { stroke: "#999", strokeWidth: 2 },
            });
          }
        });
      });
    });

    return { nodes, edges };
  }, [bracket]);

  const [flowNodes, setNodes, onNodesChange] = useNodesState(nodes);
  const [flowEdges, setEdges, onEdgesChange] = useEdgesState(edges);

  React.useEffect(() => {
    setNodes(nodes);
    setEdges(edges);
  }, [nodes, edges, setNodes, setEdges]);

  if (!bracket || Object.keys(bracket).length === 0) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
        <Typography>
          Aún no se han generado los emparejamientos para este torneo
        </Typography>
        {!user?.role || user.role !== "admin" ? null : (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap={2}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={onGenerateBracket}
              disabled={generatingBracket}
            >
              {generatingBracket ? (
                <>
                  <CircularProgress size={24} color="inherit" />
                  <Box ml={2}>Generando bracket...</Box>
                </>
              ) : (
                "Generar Bracket"
              )}
            </Button>
            {generationError && (
              <Typography color="error" mt={2}>
                {generationError}
              </Typography>
            )}
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ height: "80vh", width: "100%", background: "#f5f5f5" }}>
      <Paper
        elevation={3}
        sx={{
          height: "calc(100% - 60px)",
          p: 1,
          background: "transparent",
        }}
      >
        <ReactFlow
          nodes={flowNodes}
          edges={flowEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{
            padding: 0.5,
            includeHiddenNodes: true,
          }}
          minZoom={0.1}
          maxZoom={1.5}
          nodesDraggable={false}
          elementsSelectable={false}
          connectionMode="strict"
          defaultViewport={{ x: 0, y: 0, zoom: 0.7 }}
        >
          <Background color="#026937" gap={20} />
          <Controls />
          <MiniMap nodeColor="#e0e0e0" nodeStrokeWidth={3} zoomable pannable />
        </ReactFlow>
      </Paper>
    </Box>
  );
};

export default EliminationStage;
