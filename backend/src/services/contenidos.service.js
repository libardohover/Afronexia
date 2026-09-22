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
    `SELECT id, autor_id, titulo, categoria, descripcion, ubicacion, latitud, longitud, imagen_url, creado_en
     FROM contenidos_culturales
     WHERE ${condiciones.join(" AND ")}
     ORDER BY creado_en DESC`,
    valores
  );
  return resultado.rows;
}

async function obtenerPorId(id) {
  const resultado = await pool.query("SELECT * FROM contenidos_culturales WHERE id = $1", [id]);
  return resultado.rows[0] || null;
}

async function crear(usuarioId, datos) {
  const { titulo, categoria, descripcion, ubicacion, latitud, longitud, imagen_url } = datos;
  const resultado = await pool.query(
    `INSERT INTO contenidos_culturales (autor_id, titulo, categoria, descripcion, ubicacion, latitud, longitud, imagen_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [usuarioId, titulo, categoria, descripcion, ubicacion || null, latitud || null, longitud || null, imagen_url || null]
  );
  return resultado.rows[0];
}

async function actualizar(id, usuarioId, rolUsuario, datos) {
  const existente = await obtenerPorId(id);
  if (!existente) return null;
  if (existente.autor_id !== usuarioId && rolUsuario !== "administrador") {
    const error = new Error("No tienes permisos para editar este contenido.");
    error.status = 403;
    throw error;
  }
  const { titulo, categoria, descripcion, ubicacion, latitud, longitud, imagen_url } = datos;
  const resultado = await pool.query(
    `UPDATE contenidos_culturales SET
       titulo = COALESCE($1, titulo), categoria = COALESCE($2, categoria),
       descripcion = COALESCE($3, descripcion), ubicacion = COALESCE($4, ubicacion),
       latitud = COALESCE($5, latitud), longitud = COALESCE($6, longitud),
       imagen_url = COALESCE($7, imagen_url), actualizado_en = CURRENT_TIMESTAMP
     WHERE id = $8 RETURNING *`,
    [titulo, categoria, descripcion, ubicacion, latitud, longitud, imagen_url, id]
  );
  return resultado.rows[0];
}

async function eliminar(id, usuarioId, rolUsuario) {
  const existente = await obtenerPorId(id);
  if (!existente) return false;
  if (existente.autor_id !== usuarioId && rolUsuario !== "administrador") {
    const error = new Error("No tienes permisos para eliminar este contenido.");
    error.status = 403;
    throw error;
  }
  await pool.query("DELETE FROM contenidos_culturales WHERE id = $1", [id]);
  return true;
}

module.exports = { listar, obtenerPorId, crear, actualizar, eliminar };
