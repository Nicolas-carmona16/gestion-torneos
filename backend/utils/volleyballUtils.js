/**
 * @file volleyballUtils.js
 * @module utils/volleyballUtils
 * @description Utility functions for volleyball match calculations and validations.
 */

/**
 * Validates volleyball set scores according to FIVB rules
 * @param {Array} setScores - Array of set scores
 * @param {Object} sportRules - Sport rules from database
 * @returns {Object} Validation result with isValid and errors
 */
export const validateVolleyballSets = (setScores, sportRules) => {
  const errors = [];
  const regularSetPoints = sportRules.sets?.regularSetPoints || 25;
  const lastSetPoints = sportRules.sets?.lastSetPoints || 15;
  const minDifference = sportRules.sets?.minDifference || 2;
  const setsToWin = sportRules.setsToWin || 3;

  if (!setScores || setScores.length === 0) {
    return { isValid: false, errors: ["No se han registrado sets"] };
  }

  // Validar que no haya más de 5 sets (máximo posible)
  if (setScores.length > 5) {
    errors.push("No se pueden jugar más de 5 sets");
  }

  // Validar cada set
  setScores.forEach((set, index) => {
    const { setNumber, scoreTeam1, scoreTeam2 } = set;
    const isLastSet = setNumber === 5;
    const requiredPoints = isLastSet ? lastSetPoints : regularSetPoints;

    // Validar que los puntajes sean números válidos
    if (typeof scoreTeam1 !== "number" || typeof scoreTeam2 !== "number") {
      errors.push(`Set ${setNumber}: Los puntajes deben ser números válidos`);
      return;
    }

    // Validar que los puntajes no sean negativos
    if (scoreTeam1 < 0 || scoreTeam2 < 0) {
      errors.push(`Set ${setNumber}: Los puntajes no pueden ser negativos`);
    }

    // Validar que al menos un equipo tenga los puntos requeridos
    if (scoreTeam1 < requiredPoints && scoreTeam2 < requiredPoints) {
      errors.push(
        `Set ${setNumber}: Al menos un equipo debe tener ${requiredPoints} puntos`
      );
    }

    // Validar diferencia mínima
    const difference = Math.abs(scoreTeam1 - scoreTeam2);
    if (difference > 0 && difference < minDifference) {
      errors.push(
        `Set ${setNumber}: La diferencia debe ser de al menos ${minDifference} puntos`
      );
    }

    // Validar que no haya empate
    if (scoreTeam1 === scoreTeam2) {
      errors.push(`Set ${setNumber}: No puede haber empate en voleibol`);
    }
  });

  // Validar que el partido esté completo
  const team1Sets = setScores.filter(
    (set) => set.scoreTeam1 > set.scoreTeam2
  ).length;
  const team2Sets = setScores.filter(
    (set) => set.scoreTeam2 > set.scoreTeam1
  ).length;

  if (team1Sets < setsToWin && team2Sets < setsToWin) {
    errors.push(`El partido debe completarse a ${setsToWin} sets`);
  }

  // Validar que no se jueguen sets innecesarios
  if (team1Sets >= setsToWin && team2Sets >= setsToWin) {
    errors.push("No se pueden ganar sets ambos equipos");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Calculates volleyball match result from set scores
 * @param {Array} setScores - Array of set scores
 * @param {Object} sportRules - Sport rules from database
 * @returns {Object} Match result with sets won and winner
 */
export const calculateVolleyballResult = (setScores, sportRules) => {
  const setsToWin = sportRules.setsToWin || 3;
  const team1Sets = setScores.filter(
    (set) => set.scoreTeam1 > set.scoreTeam2
  ).length;
  const team2Sets = setScores.filter(
    (set) => set.scoreTeam2 > set.scoreTeam1
  ).length;

  let winner = null;
  if (team1Sets >= setsToWin) {
    winner = "team1";
  } else if (team2Sets >= setsToWin) {
    winner = "team2";
  }

  return {
    setsTeam1: team1Sets,
    setsTeam2: team2Sets,
    winner,
    isComplete: team1Sets >= setsToWin || team2Sets >= setsToWin,
  };
};

/**
 * Calculates points for volleyball standings based on set results
 * @param {Object} matchResult - Match result from calculateVolleyballResult
 * @param {Object} sportRules - Sport rules from database
 * @returns {Object} Points for both teams
 */
export const calculateVolleyballPoints = (matchResult, sportRules) => {
  const { setsTeam1, setsTeam2, isComplete } = matchResult;
  const scoringRules = sportRules.scoring || {};

  if (!isComplete) {
    return { team1Points: 0, team2Points: 0 };
  }

  // Determinar el tipo de victoria
  const is3_0_or_3_1 =
    (setsTeam1 === 3 && setsTeam2 <= 1) || (setsTeam2 === 3 && setsTeam1 <= 1);
  const is3_2 =
    (setsTeam1 === 3 && setsTeam2 === 2) ||
    (setsTeam2 === 3 && setsTeam1 === 2);

  let team1Points, team2Points;

  if (setsTeam1 > setsTeam2) {
    // Equipo 1 gana
    if (is3_0_or_3_1) {
      team1Points = scoringRules.win3_0_or_3_1 || 3;
      team2Points = scoringRules.loss1_3_or_0_3 || 0;
    } else if (is3_2) {
      team1Points = scoringRules.win3_2 || 2;
      team2Points = scoringRules.loss2_3 || 1;
    }
  } else {
    // Equipo 2 gana
    if (is3_0_or_3_1) {
      team1Points = scoringRules.loss1_3_or_0_3 || 0;
      team2Points = scoringRules.win3_0_or_3_1 || 3;
    } else if (is3_2) {
      team1Points = scoringRules.loss2_3 || 1;
      team2Points = scoringRules.win3_2 || 2;
    }
  }

  return { team1Points, team2Points };
};

/**
 * Determines if a sport is volleyball
 * @param {string} sportName - Name of the sport
 * @returns {boolean} True if the sport is volleyball
 */
export const isVolleyball = (sportName) => {
  return sportName === "Voleibol";
};

/**
 * Gets the appropriate score display for a match based on sport
 * @param {Object} match - Match object
 * @param {string} sportName - Name of the sport
 * @returns {Object} Score display information
 */
export const getScoreDisplay = (match, sportName) => {
  if (isVolleyball(sportName)) {
    return {
      primary: `${match.setsTeam1 || 0} - ${match.setsTeam2 || 0}`,
      secondary:
        match.setScores
          ?.map((set) => `${set.scoreTeam1}-${set.scoreTeam2}`)
          .join(", ") || "",
      type: "sets",
    };
  } else {
    return {
      primary: `${match.scoreTeam1 || 0} - ${match.scoreTeam2 || 0}`,
      secondary: "",
      type: "goals",
    };
  }
};
