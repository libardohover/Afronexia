const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const SALT_ROUNDS = 10;

async function registrar({ nombre, email, password, telefono, preferencias }) {
  const yaExiste = await pool.query("SELECT id FROM usuarios WHERE email = $1", [email]);
  if (yaExiste.rows.length > 0) {
    const error = new Error("Ya existe una cuenta con ese correo.");
    error.status = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const resultado = await pool.query(
    `INSERT INTO usuarios (nombre, email, password_hash, telefono, rol, preferencias)
     VALUES ($1, $2, $3, $4, 'usuario', $5)
     RETURNING id, nombre, email, rol, fecha_registro`,
    [nombre, email, passwordHash, telefono || null, JSON.stringify(preferencias || [])]
  );

  return generarSesion(resultado.rows[0]);
}

async function iniciarSesion({ email, password }) {
  const resultado = await pool.query(
    "SELECT id, nombre, email, password_hash, rol, activo FROM usuarios WHERE email = $1",
    [email]
  );

  const usuario = resultado.rows[0];
  if (!usuario || !usuario.activo) {
    const error = new Error("Credenciales inválidas.");
    error.status = 401;
    throw error;
  }

  const coincide = await bcrypt.compare(password, usuario.password_hash);
  if (!coincide) {
    const error = new Error("Credenciales inválidas.");
    error.status = 401;
    throw error;
  }

  delete usuario.password_hash;
  return generarSesion(usuario);
}

function generarSesion(usuario) {
  const token = jwt.sign(
    { id: usuario.id, rol: usuario.rol, email: usuario.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
  return { usuario, token };
}

module.exports = { registrar, iniciarSesion };
