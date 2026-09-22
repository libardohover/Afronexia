/**
 * Fase 1 IA — Preparación de datos y vectorización.
 *
 * Sincroniza ofertas_culturales a partir de las tablas reales del sistema
 * (emprendimientos, eventos, contenidos_culturales) y, si hay una
 * OPENAI_API_KEY configurada, genera el embedding de cada oferta nueva o
 * modificada para que NEXIA pueda encontrarla por búsqueda semántica.
 *
 * Uso:
 *   node src/scripts/sincronizar_ofertas_culturales.js
 *
 * Sin OPENAI_API_KEY: sincroniza igual los datos pero deja embedding en
 * NULL, para no bloquear el resto del sistema por falta de credenciales.
 */
const pool = require("../config/db");
require("dotenv").config();

const tieneApiKey = !!process.env.OPENAI_API_KEY;
let openai = null;
if (tieneApiKey) {
  const OpenAI = require("openai");
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

async function generarEmbedding(texto) {
  if (!openai) return null;
  const respuesta = await openai.embeddings.create({ model: "text-embedding-3-small", input: texto });
  return respuesta.data[0].embedding;
}

async function upsertOferta({ titulo, categoria, descripcion, ubicacion, contacto, fuente_tipo, fuente_id }) {
  const textoCompleto = `${titulo}. Categoría: ${categoria}. ${descripcion} Ubicación: ${ubicacion || "no especificada"}.`;
  const embedding = await generarEmbedding(textoCompleto);
  const embeddingFormateado = embedding ? `[${embedding.join(",")}]` : null;

  await pool.query(
    `INSERT INTO ofertas_culturales (titulo, categoria, descripcion, ubicacion, contacto, embedding, fuente_tipo, fuente_id)
     VALUES ($1, $2, $3, $4, $5, $6::vector, $7, $8)
     ON CONFLICT (fuente_tipo, fuente_id) DO UPDATE SET
       titulo = EXCLUDED.titulo, categoria = EXCLUDED.categoria, descripcion = EXCLUDED.descripcion,
       ubicacion = EXCLUDED.ubicacion, contacto = EXCLUDED.contacto,
       embedding = COALESCE(EXCLUDED.embedding, ofertas_culturales.embedding),
       updated_at = CURRENT_TIMESTAMP`,
    [titulo, categoria, descripcion, ubicacion, contacto, embeddingFormateado, fuente_tipo, fuente_id]
  );
}

async function sincronizar() {
  console.log(`Sincronizando ofertas_culturales... (embeddings ${tieneApiKey ? "SÍ" : "NO"} se generarán: ${tieneApiKey ? "OPENAI_API_KEY presente" : "falta OPENAI_API_KEY"})`);

  const emprendimientos = await pool.query("SELECT id, nombre, categoria, descripcion, ubicacion, contacto FROM emprendimientos WHERE publicado = TRUE");
  for (const e of emprendimientos.rows) {
    await upsertOferta({ titulo: e.nombre, categoria: e.categoria, descripcion: e.descripcion, ubicacion: e.ubicacion, contacto: e.contacto, fuente_tipo: "emprendimiento", fuente_id: e.id });
  }
  console.log(`  emprendimientos sincronizados: ${emprendimientos.rows.length}`);

  const eventos = await pool.query("SELECT id, titulo, categoria, descripcion, ubicacion FROM eventos WHERE publicado = TRUE");
  for (const e of eventos.rows) {
    await upsertOferta({ titulo: e.titulo, categoria: e.categoria || "Evento", descripcion: e.descripcion, ubicacion: e.ubicacion, contacto: null, fuente_tipo: "evento", fuente_id: e.id });
  }
  console.log(`  eventos sincronizados: ${eventos.rows.length}`);

  const contenidos = await pool.query("SELECT id, titulo, categoria, descripcion, ubicacion FROM contenidos_culturales WHERE publicado = TRUE");
  for (const c of contenidos.rows) {
    await upsertOferta({ titulo: c.titulo, categoria: c.categoria, descripcion: c.descripcion, ubicacion: c.ubicacion, contacto: null, fuente_tipo: "contenido", fuente_id: c.id });
  }
  console.log(`  contenidos culturales sincronizados: ${contenidos.rows.length}`);

  console.log("Sincronización completa.");
  await pool.end();
}

sincronizar().catch((err) => {
  console.error("Error sincronizando ofertas_culturales:", err);
  process.exit(1);
});
