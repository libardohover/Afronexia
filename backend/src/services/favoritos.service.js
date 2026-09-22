const pool = require("../config/db");

const TIPOS_VALIDOS = ["emprendimiento", "evento", "contenido"];
const TABLA_POR_TIPO = {
  emprendimiento: { tabla: "emprendimientos", nombreCol: "nombre" },
  evento: { tabla: "eventos", nombreCol: "titulo" },
  contenido: { tabla: "contenidos_culturales", nombreCol: "titulo" },
};

function validarTipo(entidad_tipo) {
  if (!TIPOS_VALIDOS.includes(entidad_tipo)) {
    const error = new Error("entidad_tipo debe ser 'emprendimiento', 'evento' o 'contenido'.");
    error.status = 400;
    throw error;
  }
}

async function agregar(usuarioId, { entidad_tipo, entidad_id }) {
  validarTipo(entidad_tipo);
  const resultado = await pool.query(
    `INSERT INTO favoritos (usuario_id, entidad_tipo, entidad_id)
     VALUES ($1, $2, $3)
     ON CONFLICT (usuario_id, entidad_tipo, entidad_id) DO NOTHING
     RETURNING *`,
    [usuarioId, entidad_tipo, entidad_id]
  );
  return resultado.rows[0] || { usuario_id: usuarioId, entidad_tipo, entidad_id, yaExistia: true };
}

async function listar(usuarioId) {
  const resultados = [];
  for (const tipo of TIPOS_VALIDOS) {
    const { tabla, nombreCol } = TABLA_POR_TIPO[tipo];
    const filas = await pool.query(
      `SELECT f.id AS favorito_id, f.entidad_tipo, f.entidad_id, f.creado_en,
              e.${nombreCol} AS nombre, e.categoria, e.ubicacion
       FROM favoritos f JOIN ${tabla} e ON e.id = f.entidad_id
       WHERE f.usuario_id = $1 AND f.entidad_tipo = $2 ORDER BY f.creado_en DESC`,
      [usuarioId, tipo]
    );
    resultados.push(...filas.rows);
  }
  return resultados.sort((a, b) => new Date(b.creado_en) - new Date(a.creado_en));
}

async function eliminar(id, usuarioId) {
  const resultado = await pool.query("DELETE FROM favoritos WHERE id = $1 AND usuario_id = $2 RETURNING id", [id, usuarioId]);
  return resultado.rows.length > 0;
}

async function estaEnFavoritos(usuarioId, entidad_tipo, entidad_id) {
  const resultado = await pool.query(
    "SELECT id FROM favoritos WHERE usuario_id = $1 AND entidad_tipo = $2 AND entidad_id = $3",
    [usuarioId, entidad_tipo, entidad_id]
  );
  return resultado.rows[0] || null;
}

module.exports = { agregar, listar, eliminar, estaEnFavoritos, validarTipo };
