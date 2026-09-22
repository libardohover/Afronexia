const pool = require("../config/db");

async function enviarMensaje(usuarioId, { emprendimiento_id, mensaje }) {
  const emprendimiento = await pool.query("SELECT id FROM emprendimientos WHERE id = $1", [emprendimiento_id]);
  if (emprendimiento.rows.length === 0) {
    const error = new Error("El emprendimiento indicado no existe.");
    error.status = 404;
    throw error;
  }
  const resultado = await pool.query(
    `INSERT INTO mensajes_contacto (usuario_id, emprendimiento_id, mensaje) VALUES ($1, $2, $3) RETURNING *`,
    [usuarioId, emprendimiento_id, mensaje]
  );
  return resultado.rows[0];
}

async function listarRecibidos(usuarioId) {
  const resultado = await pool.query(
    `SELECT m.id, m.mensaje, m.estado, m.creado_en, m.usuario_id AS remitente_id,
            u.nombre AS remitente_nombre, e.nombre AS emprendimiento_nombre
     FROM mensajes_contacto m
     JOIN usuarios u ON u.id = m.usuario_id
     JOIN emprendimientos e ON e.id = m.emprendimiento_id
     WHERE e.usuario_id = $1 ORDER BY m.creado_en DESC`,
    [usuarioId]
  );
  return resultado.rows;
}

module.exports = { enviarMensaje, listarRecibidos };
