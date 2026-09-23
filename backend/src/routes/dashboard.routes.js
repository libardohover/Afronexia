const express = require("express");
const router = express.Router();
const { verificarToken } = require("../middlewares/auth");
const { permitirRoles } = require("../middlewares/roles");
const { stub } = require("../controllers/_stub.controller");

const pendiente = stub("Sprint 5", ["RF-13", "RF-16", "RF-20", "HU-14", "HU-17"]);

router.get("/indicadores", verificarToken, permitirRoles("administrador"), pendiente);
router.get("/auditoria", verificarToken, permitirRoles("administrador"), pendiente);

module.exports = router;
