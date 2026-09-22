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
    condiciones.push(`(nombre ILIKE $${valores.length} OR descripcion ILIKE $${valores.length})`);
  }

  const resultado = await pool.query(
    `SELECT id, usuario_id, nombre, categoria, descripcion, ubicacion, latitud, longitud, contacto, imagenes, creado_en
     FROM emprendimientos
     WHERE ${condiciones.join(" AND ")}
     ORDER BY creado_en DESC`,
    valores
  );
  return resultado.rows;
}

async function obtenerPorId(id) {
  const resultado = await pool.query("SELECT * FROM emprendimientos WHERE id = $1", [id]);
  return resultado.rows[0] || null;
}

async function crear(usuarioId, datos) {
  const { nombre, categoria, descripcion, ubicacion, latitud, longitud, contacto, imagenes } = datos;
  const resultado = await pool.query(
    `INSERT INTO emprendimientos (usuario_id, nombre, categoria, descripcion, ubicacion, latitud, longitud, contacto, imagenes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [usuarioId, nombre, categoria, descripcion, ubicacion || null, latitud || null, longitud || null, contacto || null, JSON.stringify(imagenes || [])]
  );
  return resultado.rows[0];
}

async function actualizar(id, usuarioId, rolUsuario, datos) {
  const existente = await obtenerPorId(id);
  if (!existente) return null;

  if (existente.usuario_id !== usuarioId && rolUsuario !== "administrador") {
    const error = new Error("No tienes permisos para editar este emprendimiento.");
    error.status = 403;
    throw error;
  }

  const { nombre, categoria, descripcion, ubicacion, latitud, longitud, contacto, imagenes } = datos;
  const resultado = await pool.query(
    `UPDATE emprendimientos SET
       nombre = COALESCE($1, nombre),
       categoria = COALESCE($2, categoria),
       descripcion = COALESCE($3, descripcion),
       ubicacion = COALESCE($4, ubicacion),
       latitud = COALESCE($5, latitud),
       longitud = COALESCE($6, longitud),
       contacto = COALESCE($7, contacto),
       imagenes = COALESCE($8, imagenes),
       actualizado_en = CURRENT_TIMESTAMP
     WHERE id = $9
     RETURNING *`,
    [nombre, categoria, descripcion, ubicacion, latitud, longitud, contacto, imagenes ? JSON.stringify(imagenes) : null, id]
  );
  return resultado.rows[0];
}

async function eliminar(id, usuarioId, rolUsuario) {
  const existente = await obtenerPorId(id);
  if (!existente) return false;

  if (existente.usuario_id !== usuarioId && rolUsuario !== "administrador") {
    const error = new Error("No tienes permisos para eliminar este emprendimiento.");
    error.status = 403;
    throw error;
  }

  await pool.query("DELETE FROM emprendimientos WHERE id = $1", [id]);
  return true;
}

module.exports = { listar, obtenerPorId, crear, actualizar, eliminar };
