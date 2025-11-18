/**
 * @file pdfService.js
 * @description Servicio para generar PDFs de tablas de posiciones con soporte para múltiples deportes
 */

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Detecta si un deporte es voleibol
 * @param {string} sportName - Nombre del deporte
 * @returns {boolean}
 */
const isVolleyball = (sportName) => {
  return sportName?.toLowerCase().includes("voleibol") || 
         sportName?.toLowerCase().includes("volleyball");
};

/**
 * Detecta si un deporte es de tipo fútbol
 * @param {string} sportName - Nombre del deporte
 * @returns {boolean}
 */
const isFootballSport = (sportName) => {
  const name = sportName?.toLowerCase() || "";
  return name.includes("fútbol") || 
         name.includes("futbol") || 
         name.includes("futsal");
};

/**
 * Detecta si un deporte es baloncesto
 * @param {string} sportName - Nombre del deporte
 * @returns {boolean}
 */
const isBasketball = (sportName) => {
  return sportName?.toLowerCase().includes("baloncesto") || 
         sportName?.toLowerCase().includes("basketball");
};

/**
 * Detecta si un deporte es "otro" (genérico)
 * @param {string} sportName - Nombre del deporte
 * @returns {boolean}
 */
const isOtherSport = (sportName) => {
  return sportName?.toLowerCase() === "otro" || 
         sportName?.toLowerCase() === "other";
};

/**
 * Obtiene las columnas de la tabla según el tipo de deporte
 * @param {string} sportName - Nombre del deporte
 * @returns {Array} Array de objetos con header y dataKey
 */
const getTableColumns = (sportName) => {
  const baseColumns = [
    { header: "Pos", dataKey: "position" },
    { header: "Equipo", dataKey: "teamName" },
    { header: "Pts", dataKey: "points" },
    { header: "PJ", dataKey: "played" },
    { header: "PG", dataKey: "wins" },
  ];

  if (isVolleyball(sportName)) {
    // Voleibol: Sin empates, con sets y puntos
    return [
      ...baseColumns,
      { header: "PP", dataKey: "losses" },
      { header: "SF", dataKey: "setsFor" },
      { header: "SC", dataKey: "setsAgainst" },
      { header: "DS", dataKey: "setDiff" },
      { header: "PF", dataKey: "pointsFor" },
      { header: "PC", dataKey: "pointsAgainst" },
    ];
  } else if (isFootballSport(sportName)) {
    // Fútbol/Futsal: Con empates, goles
    return [
      ...baseColumns,
      { header: "PE", dataKey: "draws" },
      { header: "PP", dataKey: "losses" },
      { header: "GF", dataKey: "goalsFor" },
      { header: "GC", dataKey: "goalsAgainst" },
      { header: "DG", dataKey: "goalDiff" },
    ];
  } else if (isBasketball(sportName)) {
    // Baloncesto: Sin empates, puntos anotados/recibidos
    return [
      ...baseColumns,
      { header: "PP", dataKey: "losses" },
      { header: "PA", dataKey: "goalsFor" }, // Puntos anotados
      { header: "PR", dataKey: "goalsAgainst" }, // Puntos recibidos
      { header: "DP", dataKey: "goalDiff" }, // Diferencia de puntos
    ];
  } else if (isOtherSport(sportName)) {
    // Otro: Genérico con puntos anotados/recibidos, sin empates
    return [
      ...baseColumns,
      { header: "PP", dataKey: "losses" },
      { header: "PA", dataKey: "goalsFor" }, // Puntos anotados
      { header: "PR", dataKey: "goalsAgainst" }, // Puntos recibidos
      { header: "DP", dataKey: "goalDiff" }, // Diferencia de puntos
    ];
  } else {
    // Default: Fútbol/Futsal
    return [
      ...baseColumns,
      { header: "PE", dataKey: "draws" },
      { header: "PP", dataKey: "losses" },
      { header: "GF", dataKey: "goalsFor" },
      { header: "GC", dataKey: "goalsAgainst" },
      { header: "DG", dataKey: "goalDiff" },
    ];
  }
};

/**
 * Procesa los datos de un equipo para el PDF
 * @param {Object} team - Datos del equipo
 * @param {number} index - Posición del equipo
 * @param {string} sportName - Nombre del deporte
 * @returns {Object} Objeto con los datos procesados
 */
const processTeamData = (team, index, sportName) => {
  const baseData = {
    position: index + 1,
    teamName: typeof team.team === "object" ? team.team.name : "Equipo no encontrado",
    points: team.points,
    played: team.played,
    wins: team.wins,
  };

  if (isVolleyball(sportName)) {
    return {
      ...baseData,
      losses: team.losses,
      setsFor: team.setsFor || 0,
      setsAgainst: team.setsAgainst || 0,
      setDiff: (team.setsFor || 0) - (team.setsAgainst || 0),
      pointsFor: team.pointsFor || 0,
      pointsAgainst: team.pointsAgainst || 0,
    };
  } else {
    // Para fútbol, baloncesto, otro y default
    return {
      ...baseData,
      draws: team.draws || 0,
      losses: team.losses,
      goalsFor: team.goalsFor || 0,
      goalsAgainst: team.goalsAgainst || 0,
      goalDiff: (team.goalsFor || 0) - (team.goalsAgainst || 0),
    };
  }
};

/**
 * Obtiene el color de fondo para una fila según si clasifica o es wildcard
 * @param {number} index - Posición del equipo (0-based)
 * @param {number} teamsAdvancing - Número de equipos que clasifican directamente
 * @param {boolean} isWildcard - Si el equipo es wildcard
 * @returns {Array|null} Color RGB o null
 */
const getRowColor = (index, teamsAdvancing, isWildcard) => {
  if (isWildcard) {
    return [255, 243, 205]; // Amarillo claro para wildcards
  }
  if (index < teamsAdvancing) {
    return [212, 237, 218]; // Verde claro para clasificados
  }
  return null;
};

/**
 * Genera un PDF con las tablas de posiciones de todos los grupos
 * @param {Object} standingsByGroup - Objeto con los standings por grupo
 * @param {Object} tournamentInfo - Información del torneo
 * @param {string} sportName - Nombre del deporte
 * @param {number} teamsAdvancing - Número de equipos que avanzan por grupo
 * @param {Array} wildcardTeamIds - IDs de equipos que clasifican como wildcards
 */
export const generateStandingsPDF = (
  standingsByGroup,
  tournamentInfo,
  sportName,
  teamsAdvancing = 2,
  wildcardTeamIds = []
) => {
  // Crear documento en orientación horizontal (mejor para tablas anchas)
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;

  // Título principal
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("TABLAS DE POSICIONES", pageWidth / 2, margin, { align: "center" });

  // Información del torneo
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  let yPosition = margin + 8;
  doc.text(`Torneo: ${tournamentInfo.name}`, margin, yPosition);
  yPosition += 6;
  doc.text(`Deporte: ${sportName}`, margin, yPosition);
  yPosition += 6;
  
  const currentDate = new Date().toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  doc.text(`Fecha: ${currentDate}`, margin, yPosition);
  yPosition += 10;

  // Leyenda de colores
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  
  // Verde - Clasifican directamente
  doc.setFillColor(212, 237, 218);
  doc.rect(margin, yPosition - 3, 5, 4, "F");
  doc.text("Clasifican directamente", margin + 7, yPosition);
  
  // Amarillo - Wildcards
  doc.setFillColor(255, 243, 205);
  doc.rect(margin + 60, yPosition - 3, 5, 4, "F");
  doc.text("Clasifican como wildcards", margin + 67, yPosition);
  
  yPosition += 8;

  // Obtener columnas según el deporte
  const columns = getTableColumns(sportName);

  // Configuración de estilos para las tablas
  const tableStyles = {
    theme: "grid",
    headStyles: {
      fillColor: [248, 249, 250],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      fontSize: 9,
      halign: "center",
    },
    bodyStyles: {
      fontSize: 8,
      cellPadding: 2,
    },
    columnStyles: {
      position: { halign: "center", cellWidth: 12 },
      teamName: { halign: "left", cellWidth: "auto" },
      points: { halign: "center", fontStyle: "bold" },
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    margin: { left: margin, right: margin },
  };

  // Generar tabla para cada grupo
  const groups = Object.keys(standingsByGroup).sort();
  
  groups.forEach((groupName, groupIndex) => {
    const teams = standingsByGroup[groupName];

    // Si no es el primer grupo y no hay espacio, añadir nueva página
    if (groupIndex > 0 && yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = margin;
    }

    // Título del grupo
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`Grupo ${groupName}`, margin, yPosition);
    yPosition += 7;

    // Procesar datos de los equipos
    const tableData = teams.map((team, index) => {
      return processTeamData(team, index, sportName);
    });

    // Generar la tabla usando autoTable como función
    autoTable(doc, {
      startY: yPosition,
      columns: columns,
      body: tableData,
      ...tableStyles,
      didParseCell: (data) => {
        // Aplicar colores de fondo a las filas
        if (data.section === "body") {
          const team = teams[data.row.index];
          const teamId = team.team._id?.toString() || team.team.toString();
          const isWildcard = wildcardTeamIds.includes(teamId);
          const color = getRowColor(data.row.index, teamsAdvancing, isWildcard);
          
          if (color) {
            data.cell.styles.fillColor = color;
          }
        }
      },
    });

    // Actualizar posición Y para el siguiente grupo
    yPosition = doc.lastAutoTable.finalY + 10;
  });

  // Pie de página con número de página
  const totalPages = doc.internal.pages.length - 1; // -1 porque la primera página es null
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Página ${i} de ${totalPages}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: "center" }
    );
  }

  // Guardar el PDF
  const fileName = `Tabla_Posiciones_${tournamentInfo.name.replace(/\s+/g, "_")}_${currentDate.replace(/\s+/g, "_")}.pdf`;
  doc.save(fileName);
};

/**
 * Genera encabezados de columnas con tooltips/descripciones
 * @param {string} sportName - Nombre del deporte
 * @returns {Object} Objeto con descripciones de columnas
 */
export const getColumnDescriptions = (sportName) => {
  const baseDescriptions = {
    Pos: "Posición",
    Equipo: "Nombre del equipo",
    Pts: "Puntos",
    PJ: "Partidos Jugados",
    PG: "Partidos Ganados",
  };

  if (isVolleyball(sportName)) {
    return {
      ...baseDescriptions,
      PP: "Partidos Perdidos",
      SF: "Sets a Favor",
      SC: "Sets en Contra",
      DS: "Diferencia de Sets",
      PF: "Puntos a Favor",
      PC: "Puntos en Contra",
    };
  } else if (isFootballSport(sportName)) {
    return {
      ...baseDescriptions,
      PE: "Partidos Empatados",
      PP: "Partidos Perdidos",
      GF: "Goles a Favor",
      GC: "Goles en Contra",
      DG: "Diferencia de Goles",
    };
  } else if (isBasketball(sportName)) {
    return {
      ...baseDescriptions,
      PP: "Partidos Perdidos",
      PA: "Puntos Anotados",
      PR: "Puntos Recibidos",
      DP: "Diferencia de Puntos",
    };
  } else if (isOtherSport(sportName)) {
    return {
      ...baseDescriptions,
      PP: "Partidos Perdidos",
      PA: "Puntos Anotados",
      PR: "Puntos Recibidos",
      DP: "Diferencia de Puntos",
    };
  } else {
    // Default: Fútbol/Futsal
    return {
      ...baseDescriptions,
      PE: "Partidos Empatados",
      PP: "Partidos Perdidos",
      GF: "Goles a Favor",
      GC: "Goles en Contra",
      DG: "Diferencia de Goles",
    };
  }
};

export default {
  generateStandingsPDF,
  getColumnDescriptions,
};
