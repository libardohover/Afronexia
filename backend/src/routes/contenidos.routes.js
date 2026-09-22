const express = require("express");
const router = express.Router();
const controller = require("../controllers/contenidos.controller");
const { verificarToken } = require("../middlewares/auth");
const { permitirRoles } = require("../middlewares/roles");

router.get("/", controller.listar);
router.get("/:id", controller.obtener);
router.post("/", verificarToken, permitirRoles("gestor_cultural", "administrador"), controller.crear);
router.put("/:id", verificarToken, permitirRoles("gestor_cultural", "administrador"), controller.actualizar);
router.delete("/:id", verificarToken, permitirRoles("gestor_cultural", "administrador"), controller.eliminar);

module.exports = router;
