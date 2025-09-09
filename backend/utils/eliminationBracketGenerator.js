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
 * Genera partidos de eliminación directa después de fase de grupos
 * @param {Object} tournament - Torneo
 * @param {Array} advancingTeams - Equipos que avanzan
 * @returns {Array} Partidos generados
 */
export const generatePlayoffBracket = async (tournament, advancingTeams) => {
  return generateEliminationBracket(tournament, advancingTeams);
};
