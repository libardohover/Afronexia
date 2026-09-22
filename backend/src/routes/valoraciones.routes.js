const express = require("express");
const router = express.Router();
const controller = require("../controllers/valoraciones.controller");
const { verificarToken } = require("../middlewares/auth");

router.get("/", controller.listarPorEntidad);
router.post("/", verificarToken, controller.crear);
router.delete("/:id", verificarToken, controller.eliminar);

module.exports = router;
