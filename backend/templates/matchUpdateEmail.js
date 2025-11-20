/**
 * @file matchUpdateEmail.js
 * @module templates/matchUpdateEmail
 * @description Plantillas HTML para correos de actualización de partidos
 */

/**
 * Genera el HTML del correo para notificar cambios en un partido
 * @param {Object} params - Parámetros para la plantilla
 * @param {string} params.captainName - Nombre del capitán
 * @param {string} params.teamName - Nombre del equipo
 * @param {string} params.tournamentName - Nombre del torneo
 * @param {string} params.opponentTeamName - Nombre del equipo contrario
 * @param {Object} params.changes - Objeto con los cambios realizados
 * @param {string} [params.changes.date] - Nueva fecha (si cambió)
 * @param {string} [params.changes.time] - Nueva hora (si cambió)
 * @param {string} [params.changes.description] - Nueva descripción (si cambió)
 * @param {string} [params.changes.location] - Nueva ubicación (si cambió)
 * @returns {string} HTML del correo
 */
export const generateMatchUpdateEmailHTML = ({
  captainName,
  teamName,
  tournamentName,
  opponentTeamName,
  changes,
}) => {
  const changesList = [];
  
  if (changes.date) {
    changesList.push(`<li><strong>Fecha:</strong> ${changes.date.old} → <span style="color: #026937;">${changes.date.new}</span></li>`);
  }
  
  if (changes.time) {
    changesList.push(`<li><strong>Hora:</strong> ${changes.time.old} → <span style="color: #026937;">${changes.time.new}</span></li>`);
  }
  
  if (changes.location) {
    changesList.push(`<li><strong>Ubicación:</strong> ${changes.location.old || 'Sin ubicación'} → <span style="color: #026937;">${changes.location.new}</span></li>`);
  }
  
  if (changes.description) {
    changesList.push(`<li><strong>Descripción:</strong> ${changes.description.old || 'Sin descripción'} → <span style="color: #026937;">${changes.description.new}</span></li>`);
  }

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Actualización de Partido</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .header {
          background-color: #026937;
          color: #ffffff;
          padding: 30px 20px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
        }
        .content {
          padding: 30px 20px;
          color: #333333;
          line-height: 1.6;
        }
        .greeting {
          font-size: 18px;
          margin-bottom: 20px;
        }
        .match-info {
          background-color: #f9f9f9;
          border-left: 4px solid #026937;
          padding: 15px;
          margin: 20px 0;
        }
        .match-info h2 {
          margin-top: 0;
          color: #026937;
          font-size: 18px;
        }
        .changes-list {
          background-color: #fff3cd;
          border: 1px solid #ffc107;
          border-radius: 4px;
          padding: 15px 20px;
          margin: 20px 0;
        }
        .changes-list h3 {
          margin-top: 0;
          color: #856404;
          font-size: 16px;
        }
        .changes-list ul {
          margin: 10px 0;
          padding-left: 20px;
        }
        .changes-list li {
          margin: 8px 0;
        }
        .footer {
          background-color: #f4f4f4;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #666666;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background-color: #026937;
          color: #ffffff;
          text-decoration: none;
          border-radius: 4px;
          margin: 20px 0;
        }
        .important-note {
          background-color: #e3f2fd;
          border-left: 4px solid #2196f3;
          padding: 15px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚽ Actualización de Partido</h1>
        </div>
        
        <div class="content">
          <p class="greeting">Hola <strong>${captainName}</strong>,</p>
          
          <p>Te informamos que se ha realizado una <strong>actualización</strong> en uno de los partidos de tu equipo <strong>${teamName}</strong> en el torneo <strong>${tournamentName}</strong>.</p>
          
          <div class="match-info">
            <h2>📋 Información del Partido</h2>
            <p><strong>Tu equipo:</strong> ${teamName}</p>
            <p><strong>Equipo contrario:</strong> ${opponentTeamName}</p>
            <p><strong>Torneo:</strong> ${tournamentName}</p>
          </div>
          
          <div class="changes-list">
            <h3>🔔 Cambios realizados:</h3>
            <ul>
              ${changesList.join('\n')}
            </ul>
          </div>
          
          <div class="important-note">
            <p><strong>⚠️ Importante:</strong> Por favor, asegúrate de comunicar estos cambios a todos los miembros de tu equipo para evitar inconvenientes.</p>
          </div>
          
          <p>Si tienes alguna pregunta o inquietud sobre estos cambios, no dudes en contactar a la organización del torneo.</p>
          
          <p style="margin-top: 30px;">Saludos cordiales,<br>
          <strong>Equipo de Gestión de Torneos</strong></p>
        </div>
        
        <div class="footer">
          <p>Este es un correo automático, por favor no responder.</p>
          <p>&copy; ${new Date().getFullYear()} Sistema de Gestión de Torneos - Facultad de Ingeniería UdeA</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Genera el texto plano del correo (fallback para clientes sin HTML)
 * @param {Object} params - Parámetros para la plantilla
 * @returns {string} Texto plano del correo
 */
export const generateMatchUpdateEmailText = ({
  captainName,
  teamName,
  tournamentName,
  opponentTeamName,
  changes,
}) => {
  let changesText = "";
  
  if (changes.date) {
    changesText += `- Fecha: ${changes.date.old} → ${changes.date.new}\n`;
  }
  if (changes.time) {
    changesText += `- Hora: ${changes.time.old} → ${changes.time.new}\n`;
  }
  if (changes.location) {
    changesText += `- Ubicación: ${changes.location.old || 'Sin ubicación'} → ${changes.location.new}\n`;
  }
  if (changes.description) {
    changesText += `- Descripción: ${changes.description.old || 'Sin descripción'} → ${changes.description.new}\n`;
  }

  return `
ACTUALIZACIÓN DE PARTIDO

Hola ${captainName},

Te informamos que se ha realizado una actualización en uno de los partidos de tu equipo ${teamName} en el torneo ${tournamentName}.

INFORMACIÓN DEL PARTIDO:
- Tu equipo: ${teamName}
- Equipo contrario: ${opponentTeamName}
- Torneo: ${tournamentName}

CAMBIOS REALIZADOS:
${changesText}

IMPORTANTE: Por favor, asegúrate de comunicar estos cambios a todos los miembros de tu equipo para evitar inconvenientes.

Si tienes alguna pregunta o inquietud sobre estos cambios, no dudes en contactar a la organización del torneo.

Saludos cordiales,
Equipo de Gestión de Torneos

---
Este es un correo automático, por favor no responder.
© ${new Date().getFullYear()} Sistema de Gestión de Torneos - Facultad de Ingeniería UdeA
  `.trim();
};

export default {
  generateMatchUpdateEmailHTML,
  generateMatchUpdateEmailText,
};
