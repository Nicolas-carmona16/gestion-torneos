/**
 * @file emailService.js
 * @module utils/emailService
 * @description Servicio para envío de correos electrónicos usando Nodemailer
 */

import { createTransport } from "nodemailer";

/**
 * Configuración del transporter de nodemailer
 * Utiliza las credenciales del archivo .env
 */
const createTransporter = () => {
  return createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === "true", // true para 465, false para otros puertos
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * Envía un correo electrónico
 * @param {Object} options - Opciones del correo
 * @param {string|string[]} options.to - Destinatario(s) del correo
 * @param {string} options.subject - Asunto del correo
 * @param {string} options.html - Contenido HTML del correo
 * @param {string} [options.text] - Contenido de texto plano (opcional)
 * @returns {Promise<Object>} Información del correo enviado
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_USER}>`,
      to: Array.isArray(to) ? to.join(", ") : to,
      subject,
      html,
      text: text || "", // Texto plano como fallback
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Correo enviado exitosamente:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error al enviar correo:", error);
    throw new Error(`No se pudo enviar el correo: ${error.message}`);
  }
};

/**
 * Verifica la configuración del servicio de correo
 * @returns {Promise<boolean>} true si la configuración es válida
 */
export const verifyEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log("Configuración de correo verificada correctamente");
    return true;
  } catch (error) {
    console.error("Error en la configuración de correo:", error);
    return false;
  }
};

export default {
  sendEmail,
  verifyEmailConfig,
};
