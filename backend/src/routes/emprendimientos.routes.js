const express = require("express");
const router = express.Router();
const controller = require("../controllers/emprendimientos.controller");
const { verificarToken } = require("../middlewares/auth");
const { permitirRoles } = require("../middlewares/roles");

router.get("/", controller.listar);
router.get("/:id", controller.obtener);

router.post("/", verificarToken, permitirRoles("emprendedor", "administrador"), controller.crear);
router.put("/:id", verificarToken, permitirRoles("emprendedor", "administrador"), controller.actualizar);
router.delete("/:id", verificarToken, permitirRoles("emprendedor", "administrador"), controller.eliminar);

module.exports = router;
