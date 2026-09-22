const pool = require("../config/db");

const TIPOS_VALIDOS = ["emprendimiento", "evento", "contenido"];

function validarTipo(entidad_tipo) {
  if (!TIPOS_VALIDOS.includes(entidad_tipo)) {
    const error = new Error("entidad_tipo debe ser 'emprendimiento', 'evento' o 'contenido'.");
    error.status = 400;
    throw error;
  }
}

async function crear(usuarioId, { entidad_tipo, entidad_id, puntuacion, comentario }) {
  validarTipo(entidad_tipo);
  if (!Number.isInteger(puntuacion) || puntuacion < 1 || puntuacion > 5) {
    const error = new Error("La puntuación debe ser un número entero entre 1 y 5.");
    error.status = 400;
    throw error;
  }
  const resultado = await pool.query(
    `INSERT INTO valoraciones (usuario_id, entidad_tipo, entidad_id, puntuacion, comentario)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (usuario_id, entidad_tipo, entidad_id)
     DO UPDATE SET puntuacion = EXCLUDED.puntuacion, comentario = EXCLUDED.comentario
     RETURNING *`,
    [usuarioId, entidad_tipo, entidad_id, puntuacion, comentario || null]
  );
  return resultado.rows[0];
}

async function listarPorEntidad(entidad_tipo, entidad_id) {
  validarTipo(entidad_tipo);
  const filas = await pool.query(
    `SELECT v.id, v.puntuacion, v.comentario, v.creado_en, u.nombre AS usuario_nombre
     FROM valoraciones v JOIN usuarios u ON u.id = v.usuario_id
     WHERE v.entidad_tipo = $1 AND v.entidad_id = $2 ORDER BY v.creado_en DESC`,
    [entidad_tipo, entidad_id]
  );
  const promedio = filas.rows.length > 0
    ? filas.rows.reduce((suma, v) => suma + v.puntuacion, 0) / filas.rows.length
    : null;
  return { promedio: promedio ? Math.round(promedio * 10) / 10 : null, total: filas.rows.length, valoraciones: filas.rows };
}

async function eliminar(id, usuarioId) {
  const resultado = await pool.query("DELETE FROM valoraciones WHERE id = $1 AND usuario_id = $2 RETURNING id", [id, usuarioId]);
  return resultado.rows.length > 0;
}

module.exports = { crear, listarPorEntidad, eliminar, validarTipo };
