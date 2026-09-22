const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { verificarToken } = require("../middlewares/auth");

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Demasiados intentos. Intenta de nuevo en unos minutos." },
});

router.post("/registro", authLimiter, authController.registro);
router.post("/login", authLimiter, authController.login);
router.get("/me", verificarToken, authController.perfilActual);

module.exports = router;
