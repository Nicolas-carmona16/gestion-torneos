/**
 * @file eliminationBracketGenerator.js
 * @module utils/eliminationBracketGenerator
 * @description Generador de brackets de eliminación directa
 */

/**
 * Genera el bracket de eliminación directa
 * @param {Object} tournament - Torneo
 * @param {Array} teams - Equipos participantes
 * @returns {Array} Partidos generados
 */
export const generateEliminationBracket = async (tournament, teams) => {
  const matches = [];
  let numTeams = teams.length;

  const shuffledTeams = [...teams].sort(() => 0.5 - Math.random());

  const totalRounds = Math.ceil(Math.log2(numTeams));

  const initialRound = getRoundByStage(totalRounds - 1);

  let bracketId = 1;
  const firstRoundMatches = [];
  const nextRoundConnections = {};

  for (let i = 0; i < shuffledTeams.length; i += 2) {
    const matchData = {
      tournament: tournament._id,
      round: initialRound,
      status: "scheduled",
      bracketId: `M${bracketId}`,
      isBestOfSeries: tournament.bestOfMatches > 1,
    };

    if (shuffledTeams[i]) {
      matchData.team1 = shuffledTeams[i]._id;
    }

    if (shuffledTeams[i + 1]) {
      matchData.team2 = shuffledTeams[i + 1]._id;
    } else {
      matchData.status = "walkover";
      matchData.winner = shuffledTeams[i]._id;
      const nextMatchId = `M${
        Math.ceil(bracketId / 2) + Math.ceil(shuffledTeams.length / 2)
      }`;
      if (!nextRoundConnections[nextMatchId]) {
        nextRoundConnections[nextMatchId] = [];
      }
      nextRoundConnections[nextMatchId].push(shuffledTeams[i]._id);
    }

    firstRoundMatches.push(matchData);
    bracketId++;
  }

  let currentRoundMatches = firstRoundMatches;
  let currentRoundNumber = 1;

  while (currentRoundNumber < totalRounds) {
    const nextRoundNumber = currentRoundNumber + 1;
    const nextRoundName = getRoundByStage(totalRounds - nextRoundNumber);
    const nextRoundMatches = [];
    const matchesInNextRound = Math.ceil(currentRoundMatches.length / 2);

    for (let i = 0; i < matchesInNextRound; i++) {
      const nextMatchId = `M${bracketId}`;
      const matchData = {
        tournament: tournament._id,
        round: nextRoundName,
        status: "pending",
        bracketId: nextMatchId,
        isBestOfSeries: tournament.bestOfMatches > 1,
      };

      if (
        nextRoundConnections[nextMatchId] &&
        nextRoundConnections[nextMatchId].length > 0
      ) {
        const advancingTeams = nextRoundConnections[nextMatchId];
        if (advancingTeams.length >= 1) {
          matchData.team1 = advancingTeams[0];
          if (advancingTeams.length >= 2) {
            matchData.team2 = advancingTeams[1];
          }
        }
      }

      nextRoundMatches.push(matchData);
      bracketId++;
    }

    currentRoundMatches.forEach((match, index) => {
      const nextMatchIndex = Math.floor(index / 2);
      if (nextRoundMatches[nextMatchIndex]) {
        match.nextMatchBracketId = nextRoundMatches[nextMatchIndex].bracketId;
      }
    });

    matches.push(...currentRoundMatches);
    currentRoundMatches = nextRoundMatches;
    currentRoundNumber++;
  }

  matches.push(...currentRoundMatches);

  return matches;
};

function getRoundByStage(stage) {
  const stages = {
    0: "final",
    1: "semi-finals",
    2: "quarter-finals",
    3: "round-of-16",
    4: "round-of-32",
  };
  return stages[stage] || "qualifying-round";
}

/**
 * Genera bracket con SEEDING: los equipos deben venir ya ordenados por seed (1..N)
 * Acepta tanto documentos Team como ObjectIds.
 * Empareja usando posiciones de bracket estándar balanceadas.
 * @param {Object} tournament
 * @param {Array} seededTeams - Array ordenado por seed (mejor primero)
 * @returns {Array} Partidos generados
 */
export const generateSeededEliminationBracket = async (tournament, seededTeams) => {
  const matches = [];
  const N = seededTeams.length;
  const totalRounds = Math.ceil(Math.log2(N));
  const initialRoundName = getRoundByStage(totalRounds - 1);

  // Helper para obtener el _id si es documento, o el valor si es ObjectId
  const getId = (t) => (t && t._id ? t._id : t);

  // Generar orden de posiciones en el cuadro (1-indexed seeds)
  const buildPositions = (n) => {
    let pos = [1, 2];
    while (pos.length < n) {
      const m = pos.length * 2;
      const next = [];
      for (const p of pos) {
        next.push(p);
        next.push(m + 1 - p);
      }
      pos = next;
    }
    return pos.slice(0, n);
  };

  const positions = N === 1 ? [1] : buildPositions(N);
  // Mapear posiciones a seeds (1-based seed index)
  // Luego formar partidos por pares consecutivos de posiciones
  const teamByPosition = new Map();
  positions.forEach((seedNumber, idx) => {
    const teamIndex = seedNumber - 1; // seed 1 -> index 0
    teamByPosition.set(idx + 1, getId(seededTeams[teamIndex])); // positions are 1-based here
  });

  let bracketIdCounter = 1;
  const currentRoundMatches = [];

  // Crear partidos de la primera ronda
  for (let i = 1; i <= N; i += 2) {
    const team1 = teamByPosition.get(i);
    const team2 = teamByPosition.get(i + 1);
    const matchData = {
      tournament: tournament._id,
      round: initialRoundName,
      status: "scheduled",
      bracketId: `M${bracketIdCounter}`,
      isBestOfSeries: tournament.bestOfMatches > 1,
      team1,
      team2,
    };
    currentRoundMatches.push(matchData);
    bracketIdCounter++;
  }

  // Construir rondas siguientes con enlaces
  let roundMatches = currentRoundMatches;
  let roundNumber = 1;
  while (roundNumber < totalRounds) {
    const nextRoundName = getRoundByStage(totalRounds - (roundNumber + 1));
    const nextRoundMatches = [];
    const nextCount = Math.ceil(roundMatches.length / 2);

    const nextRoundStartId = bracketIdCounter;
    for (let i = 0; i < nextCount; i++) {
      const match = {
        tournament: tournament._id,
        round: nextRoundName,
        status: "pending",
        bracketId: `M${bracketIdCounter}`,
        isBestOfSeries: tournament.bestOfMatches > 1,
      };
      nextRoundMatches.push(match);
      bracketIdCounter++;
    }

    // Enlazar nextMatchBracketId desde la ronda actual a la siguiente
    roundMatches.forEach((m, idx) => {
      const targetIndex = Math.floor(idx / 2);
      const targetMatch = nextRoundMatches[targetIndex];
      if (targetMatch) m.nextMatchBracketId = targetMatch.bracketId;
    });

    matches.push(...roundMatches);
    roundMatches = nextRoundMatches;
    roundNumber++;
  }

  // Agregar última ronda (final) que quedó en pending
  matches.push(...roundMatches);
  return matches;
};

/**
 * Genera partidos de eliminación directa después de fase de grupos
 * @param {Object} tournament - Torneo
 * @param {Array} advancingTeams - Equipos que avanzan
 * @returns {Array} Partidos generados
 */
export const generatePlayoffBracket = async (tournament, advancingTeams) => {
  // Para play-offs posteriores a grupos, usar SEEDING.
  return generateSeededEliminationBracket(tournament, advancingTeams);
};
