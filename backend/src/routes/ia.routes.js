const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();
const controller = require("../controllers/ia.controller");
const { identificarSiHaySesion, verificarToken } = require("../middlewares/auth");
const { permitirRoles } = require("../middlewares/roles");

// RNF-16: máximo 15 consultas por minuto por IP, para prevenir abuso y sobrecostos de la API de IA.
const iaLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  message: { error: "Límite de consultas a NEXIA excedido. Intenta de nuevo en un minuto." },
});

// RF-11, HU-10 — público: NEXIA responde a visitantes sin cuenta, y se
// identifica al usuario solo si envía un token (para el registro RF-19).
router.post("/chat", iaLimiter, identificarSiHaySesion, controller.chat);

// RF-12, HU-11 — público, con personalización si hay sesión.
router.get("/recomendaciones", identificarSiHaySesion, controller.recomendar);

// Valor agregado (Objetivo 4): solo emprendedores/administradores redactan con ayuda de IA.
router.post("/optimizar-texto", iaLimiter, verificarToken, permitirRoles("emprendedor", "administrador"), controller.optimizarTexto);

// RF-19: calificar una respuesta de NEXIA (pulgar arriba/abajo). Público: no requiere cuenta.
router.post("/interacciones/:id/calificar", controller.calificar);

module.exports = router;
