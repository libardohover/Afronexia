const express = require("express");
const router = express.Router();
const controller = require("../controllers/favoritos.controller");
const { verificarToken } = require("../middlewares/auth");

router.get("/", verificarToken, controller.listar);
router.get("/estado", verificarToken, controller.estado);
router.post("/", verificarToken, controller.agregar);
router.delete("/:id", verificarToken, controller.eliminar);

module.exports = router;
