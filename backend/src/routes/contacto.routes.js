const express = require("express");
const router = express.Router();
const controller = require("../controllers/contacto.controller");
const { verificarToken } = require("../middlewares/auth");

router.post("/", verificarToken, controller.enviar);
router.get("/recibidos", verificarToken, controller.recibidos);

module.exports = router;
