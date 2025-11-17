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
    
    // Calcular sets ganados antes de este set
    const team1SetsBefore = setScores.slice(0, index).filter(s => s.scoreTeam1 > s.scoreTeam2).length;
    const team2SetsBefore = setScores.slice(0, index).filter(s => s.scoreTeam2 > s.scoreTeam1).length;
    
    // Es el último set si cualquier equipo puede ganar el partido con este set
    const couldBeDecisive = (team1SetsBefore === setsToWin - 1) || (team2SetsBefore === setsToWin - 1);
    const isLastSet = couldBeDecisive;
    
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
    if (scoreTeam1 === scoreTeam2 && scoreTeam1 > 0) {
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
  

  
  if (!isComplete) {
    return { team1Points: 0, team2Points: 0 };
  }

  // Verificar si las reglas usan el sistema simple (points.win, points.loss)
  // o el sistema complejo de voleibol (scoring.win3_0_or_3_1, etc.)
  const hasSimplePointsSystem = sportRules.points && (sportRules.points.win !== undefined);
  const hasVolleyballScoring = sportRules.scoring && (sportRules.scoring.win3_0_or_3_1 !== undefined);
  

  
  if (hasSimplePointsSystem) {
    // Sistema simple: victoria = X puntos, derrota = Y puntos
    const winPoints = sportRules.points.win || 3;
    const lossPoints = sportRules.points.loss || 0;
    
    if (setsTeam1 > setsTeam2) {
      console.log('Team 1 wins - Points assigned:', { team1: winPoints, team2: lossPoints });
      console.log('=== END VOLLEYBALL POINTS DEBUG ===');
      return { team1Points: winPoints, team2Points: lossPoints };
    } else {
      console.log('Team 2 wins - Points assigned:', { team1: lossPoints, team2: winPoints });
      console.log('=== END VOLLEYBALL POINTS DEBUG ===');
      return { team1Points: lossPoints, team2Points: winPoints };
    }
  } else if (hasVolleyballScoring) {
    // Sistema complejo de voleibol tradicional
    const scoringRules = sportRules.scoring || {};
    const setsToWin = parseInt(sportRules.setsToWin) || 3;
    
    // Determinar el tipo de victoria basado en setsToWin dinámico
    let isDominantWin, isCloseWin;
    
    if (setsToWin === 2) {
      // Para torneos que requieren 2 sets para ganar
      isDominantWin = (setsTeam1 === 2 && setsTeam2 === 0) || (setsTeam2 === 2 && setsTeam1 === 0);
      isCloseWin = (setsTeam1 === 2 && setsTeam2 === 1) || (setsTeam2 === 2 && setsTeam1 === 1);
    } else {
      // Para torneos tradicionales que requieren 3 sets para ganar
      isDominantWin = (setsTeam1 === 3 && setsTeam2 <= 1) || (setsTeam2 === 3 && setsTeam1 <= 1);
      isCloseWin = (setsTeam1 === 3 && setsTeam2 === 2) || (setsTeam2 === 3 && setsTeam1 === 2);
    }
    


    let team1Points, team2Points;

    if (setsTeam1 > setsTeam2) {
      // Equipo 1 gana
      if (isDominantWin) {
        team1Points = parseInt(scoringRules.win3_0_or_3_1) || 3;
        team2Points = parseInt(scoringRules.loss1_3_or_0_3) || 0;
      } else if (isCloseWin) {
        team1Points = parseInt(scoringRules.win3_2) || 2;
        team2Points = parseInt(scoringRules.loss2_3) || 0; // Cambié de 1 a 0

      }
    } else {
      // Equipo 2 gana
      if (isDominantWin) {
        team1Points = parseInt(scoringRules.loss1_3_or_0_3) || 0;
        team2Points = parseInt(scoringRules.win3_0_or_3_1) || 3;
      } else if (isCloseWin) {
        team1Points = parseInt(scoringRules.loss2_3) || 0; // Cambié de 1 a 0
        team2Points = parseInt(scoringRules.win3_2) || 2;
      }
    }


    return { team1Points, team2Points };
  } else {
    // Fallback: sistema por defecto
    // Fallback: sistema por defecto
    const defaultWin = 3;
    const defaultLoss = 0;
    
    if (setsTeam1 > setsTeam2) {
      return { team1Points: defaultWin, team2Points: defaultLoss };
    } else {
      return { team1Points: defaultLoss, team2Points: defaultWin };
    }
  }
};

/**
 * Determines if a sport is volleyball
 * @param {string} sportName - Name of the sport
 * @returns {boolean} True if the sport is volleyball
 */
export const isVolleyball = (sportName) => {
  if (!sportName || typeof sportName !== "string") return false;
  
  // Normalizar: quitar tildes, convertir a minúsculas
  const normalized = sportName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
  
  // Aceptar variantes: voleibol, volleyball, voley, volley
  return (
    normalized === "voleibol" ||
    normalized === "volleyball" ||
    normalized === "voley" ||
    normalized === "volley"
  );
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
