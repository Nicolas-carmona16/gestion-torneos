/**
 * @fileoverview Controller functions for handling player operations such as retrieving all players and generating Excel reports.
 * @module controllers/playerController
 */

import Player from "../models/playerModel.js";
import asyncHandler from "express-async-handler";
import ExcelJS from "exceljs";

/**
 * @function getAllPlayers
 * @desc Get all players
 * @route GET /api/players
 * @access Private (Admin only)
 */
const getAllPlayers = asyncHandler(async (req, res) => {
  const players = await Player.find({}).sort({ updatedAt: -1 });

  if (!players || players.length === 0) {
    res.status(404);
    throw new Error("No players found");
  }

  const formattedPlayers = players.map((player) => ({
    _id: player._id,
    fullName: player.fullName,
    idNumber: player.idNumber,
    email: player.email,
    career: player.career,
    eps: player.eps,
    createdAt: player.createdAt,
    updatedAt: player.updatedAt,
  }));

  res.json(formattedPlayers);
});

/**
 * @function downloadPlayersExcel
 * @desc Download all players data as Excel file
 * @route GET /api/players/download-excel
 * @access Private (Admin only)
 */
const downloadPlayersExcel = asyncHandler(async (req, res) => {
  const players = await Player.find({}).sort({ updatedAt: -1 });

  if (!players || players.length === 0) {
    res.status(404);
    throw new Error("No players found");
  }

  // Create a new workbook and worksheet
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Jugadores");

  // Define columns
  worksheet.columns = [
    { header: "Nombre Completo", key: "fullName", width: 30 },
    { header: "Número de Identificación", key: "idNumber", width: 20 },
    { header: "Correo Electrónico", key: "email", width: 35 },
    { header: "Programa Académico", key: "career", width: 25 },
    { header: "EPS", key: "eps", width: 30 },
    { header: "Fecha de Registro", key: "createdAt", width: 20 },
    { header: "Última Actualización", key: "updatedAt", width: 20 },
  ];

  // Style the header row
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE0E0E0" },
  };

  // Add data rows
  players.forEach((player) => {
    worksheet.addRow({
      fullName: player.fullName,
      idNumber: player.idNumber,
      email: player.email,
      career: player.career,
      eps: player.eps?.fileName || "No disponible",
      createdAt: player.createdAt.toLocaleDateString("es-ES"),
      updatedAt: player.updatedAt.toLocaleDateString("es-ES"),
    });
  });

  // Auto-fit columns
  worksheet.columns.forEach((column) => {
    column.alignment = { vertical: "middle", horizontal: "left" };
  });

  // Set response headers for file download
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="jugadores_${new Date().toISOString().split("T")[0]}.xlsx"`
  );

  // Write to response
  await workbook.xlsx.write(res);
  res.end();
});

export { getAllPlayers, downloadPlayersExcel }; 