const pool = require("../config/db");

async function listar({ categoria, buscar } = {}) {
  const condiciones = ["publicado = TRUE"];
  const valores = [];
  if (categoria) {
    valores.push(categoria);
    condiciones.push(`categoria = $${valores.length}`);
  }
  if (buscar) {
    valores.push(`%${buscar}%`);
    condiciones.push(`(titulo ILIKE $${valores.length} OR descripcion ILIKE $${valores.length})`);
  }
  const resultado = await pool.query(
    `SELECT id, organizador_id, titulo, categoria, descripcion, ubicacion, latitud, longitud, fecha_inicio, fecha_fin, creado_en
     FROM eventos WHERE ${condiciones.join(" AND ")} ORDER BY fecha_inicio ASC`,
    valores
  );
  return resultado.rows;
}

async function obtenerPorId(id) {
  const resultado = await pool.query("SELECT * FROM eventos WHERE id = $1", [id]);
  return resultado.rows[0] || null;
}

async function crear(usuarioId, datos) {
  const { titulo, categoria, descripcion, ubicacion, latitud, longitud, fecha_inicio, fecha_fin } = datos;
  if (!fecha_inicio) {
    const error = new Error("La fecha de inicio del evento es obligatoria.");
    error.status = 400;
    throw error;
  }
  const resultado = await pool.query(
    `INSERT INTO eventos (organizador_id, titulo, categoria, descripcion, ubicacion, latitud, longitud, fecha_inicio, fecha_fin)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
    [usuarioId, titulo, categoria || null, descripcion, ubicacion || null, latitud || null, longitud || null, fecha_inicio, fecha_fin || null]
  );
  return resultado.rows[0];
}

async function actualizar(id, usuarioId, rolUsuario, datos) {
  const existente = await obtenerPorId(id);
  if (!existente) return null;
  if (existente.organizador_id !== usuarioId && rolUsuario !== "administrador") {
    const error = new Error("No tienes permisos para editar este evento.");
    error.status = 403;
    throw error;
  }
  const { titulo, categoria, descripcion, ubicacion, latitud, longitud, fecha_inicio, fecha_fin } = datos;
  const resultado = await pool.query(
    `UPDATE eventos SET
       titulo = COALESCE($1, titulo), categoria = COALESCE($2, categoria),
       descripcion = COALESCE($3, descripcion), ubicacion = COALESCE($4, ubicacion),
       latitud = COALESCE($5, latitud), longitud = COALESCE($6, longitud),
       fecha_inicio = COALESCE($7, fecha_inicio), fecha_fin = COALESCE($8, fecha_fin),
       actualizado_en = CURRENT_TIMESTAMP
     WHERE id = $9 RETURNING *`,
    [titulo, categoria, descripcion, ubicacion, latitud, longitud, fecha_inicio, fecha_fin, id]
  );
  return resultado.rows[0];
}

async function eliminar(id, usuarioId, rolUsuario) {
  const existente = await obtenerPorId(id);
  if (!existente) return false;
  if (existente.organizador_id !== usuarioId && rolUsuario !== "administrador") {
    const error = new Error("No tienes permisos para eliminar este evento.");
    error.status = 403;
    throw error;
  }
  await pool.query("DELETE FROM eventos WHERE id = $1", [id]);
  return true;
}

module.exports = { listar, obtenerPorId, crear, actualizar, eliminar };
