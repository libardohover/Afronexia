const authService = require("../services/auth.service");
const pool = require("../config/db");

async function registro(req, res, next) {
  try {
    const { nombre, email, password, telefono, preferencias } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ error: "Nombre, email y contraseña son obligatorios." });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: "La contraseña debe tener al menos 8 caracteres." });
    }

    const sesion = await authService.registrar({ nombre, email, password, telefono, preferencias });
    res.status(201).json(sesion);
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email y contraseña son obligatorios." });
    }
    const sesion = await authService.iniciarSesion({ email, password });
    res.json(sesion);
  } catch (error) {
    next(error);
  }
}

async function perfilActual(req, res, next) {
  try {
    const resultado = await pool.query(
      "SELECT id, nombre, email, rol, telefono, preferencias, fecha_registro FROM usuarios WHERE id = $1",
      [req.usuario.id]
    );
    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }
    res.json(resultado.rows[0]);
  } catch (error) {
    next(error);
  }
}

module.exports = { registro, login, perfilActual };
