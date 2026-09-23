const pool = require("../config/db");

let openaiClient = null;
function obtenerClienteOpenAI() {
  if (!process.env.OPENAI_API_KEY) {
    const error = new Error(
      "El asistente de IA no está disponible: falta configurar OPENAI_API_KEY en el servidor."
    );
    error.status = 503;
    throw error;
  }
  if (!openaiClient) {
    const OpenAI = require("openai");
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiClient;
}

// System prompt de NEXIA — identidad y tono (RNF-17), definidos en la
// propuesta técnica de IA. Las reglas fuerzan al modelo a responder solo
// con el contexto real recuperado de pgvector, para evitar alucinaciones.
function construirSystemPrompt(contextoTexto) {
  return `Eres "NEXIA", la asistente virtual inteligente y embajadora cultural de AFRONEXIA en Barrancabermeja.
Tu misión es promover con entusiasmo y orgullo las tradiciones, gastronomía, saberes y emprendimientos de la comunidad afrodescendiente ribereña.

REGLAS:
1. Usa un tono cálido, hospitalario y alegre, con identidad cultural ribereña y afrocolombiana.
2. Basa tus recomendaciones ESTRICTAMENTE en la siguiente información oficial de Barrancabermeja:
${contextoTexto}
3. Si el usuario pregunta algo ajeno a la cultura/turismo, o no tienes el dato exacto en el contexto anterior, dilo con amabilidad en vez de inventar información, e invítalo a explorar las categorías del catálogo.
4. Siempre que menciones un emprendimiento, evento o contenido, incluye su ubicación y contacto si están disponibles en el contexto.
5. Sé breve: responde en máximo 3-4 oraciones.`;
}

// 1. Generar embedding de un texto (OpenAI text-embedding-3-small, 1536 dimensiones)
async function generarEmbedding(texto) {
  const openai = obtenerClienteOpenAI();
  const respuesta = await openai.embeddings.create({ model: "text-embedding-3-small", input: texto });
  return respuesta.data[0].embedding;
}

// 2. Asistente conversacional NEXIA (RAG) — RF-11, HU-10
async function chatConNexia(pregunta, usuarioId = null) {
  if (!pregunta || !pregunta.trim()) {
    const error = new Error("La pregunta no puede estar vacía.");
    error.status = 400;
    throw error;
  }

  // A. Vectorizar la pregunta del visitante
  const vectorConsulta = await generarEmbedding(pregunta);
  const vectorFormateado = `[${vectorConsulta.join(",")}]`;

  // B. Búsqueda por similitud de coseno en pgvector
  const resultadoDb = await pool.query(
    `SELECT titulo, categoria, descripcion, ubicacion, contacto,
            1 - (embedding <=> $1::vector) AS similitud
     FROM ofertas_culturales
     WHERE embedding IS NOT NULL
     ORDER BY similitud DESC
     LIMIT 3`,
    [vectorFormateado]
  );

  // C. Armar el contexto cultural recuperado
  const contextoTexto = resultadoDb.rows.length > 0
    ? resultadoDb.rows
        .map((r) => `- ${r.titulo} (${r.categoria}): ${r.descripcion} Ubicación: ${r.ubicacion || "no especificada"}. Contacto: ${r.contacto || "no disponible"}.`)
        .join("\n")
    : "No se encontraron lugares específicos en la base de datos para esta consulta.";

  // D. Consultar al LLM con el contexto recuperado
  const openai = obtenerClienteOpenAI();
  const completado = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: construirSystemPrompt(contextoTexto) },
      { role: "user", content: pregunta },
    ],
    temperature: 0.7,
  });

  const respuesta = completado.choices[0].message.content;
  const tokensUsados = completado.usage?.total_tokens || 0;

  // E. Registrar la interacción (RF-19)
  const registro = await pool.query(
    `INSERT INTO ai_interaction_logs (user_id, pregunta, respuesta, tokens_usados)
     VALUES ($1, $2, $3, $4) RETURNING id`,
    [usuarioId, pregunta, respuesta, tokensUsados]
  );

  return {
    respuesta,
    contextoUtilizado: resultadoDb.rows,
    interaccionId: registro.rows[0].id,
  };
}

// 3. Motor de recomendaciones personalizadas — RF-12, HU-11
async function obtenerRecomendaciones(preferenciasTexto) {
  const texto = preferenciasTexto && preferenciasTexto.trim() ? preferenciasTexto : "Turismo cultural general en Barrancabermeja";
  const vector = await generarEmbedding(texto);
  const vectorFormateado = `[${vector.join(",")}]`;

  const resultado = await pool.query(
    `SELECT id, titulo, categoria, descripcion, ubicacion, contacto, fuente_tipo, fuente_id,
            1 - (embedding <=> $1::vector) AS afinidad
     FROM ofertas_culturales
     WHERE embedding IS NOT NULL
     ORDER BY afinidad DESC
     LIMIT 4`,
    [vectorFormateado]
  );
  return resultado.rows;
}

// Envoltorio: arma el texto de preferencias a partir de las etiquetas
// guardadas en usuarios.preferencias (RF-12) para no obligar al usuario a escribir nada.
async function obtenerRecomendacionesParaUsuario(usuarioId) {
  const usuario = await pool.query("SELECT preferencias FROM usuarios WHERE id = $1", [usuarioId]);
  const etiquetas = usuario.rows[0]?.preferencias || [];
  const texto = etiquetas.length > 0 ? `Me interesa: ${etiquetas.join(", ")}` : "";
  return obtenerRecomendaciones(texto);
}

// 4. Asistente de redacción para emprendedores (valor agregado, Objetivo 4)
async function mejorarDescripcionEmprendimiento(borrador, categoria) {
  if (!borrador || !borrador.trim()) {
    const error = new Error("Escribe una idea breve para poder mejorarla.");
    error.status = 400;
    throw error;
  }
  const openai = obtenerClienteOpenAI();
  const prompt = `Mejora la siguiente descripción de un emprendimiento afrodescendiente de Barrancabermeja en la categoría "${categoria || "general"}". Hazla atractiva para turistas, profesional y destacando la riqueza cultural, en máximo 3 oraciones:\n"${borrador}"`;

  const respuesta = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.8,
  });
  return respuesta.choices[0].message.content;
}

// 5. Feedback del usuario sobre una respuesta de NEXIA (pulgar arriba/abajo)
async function calificarInteraccion(interaccionId, calificacion) {
  if (![1, -1].includes(calificacion)) {
    const error = new Error("La calificación debe ser 1 (útil) o -1 (no útil).");
    error.status = 400;
    throw error;
  }
  const resultado = await pool.query(
    "UPDATE ai_interaction_logs SET calificacion = $1 WHERE id = $2 RETURNING id",
    [calificacion, interaccionId]
  );
  if (resultado.rows.length === 0) {
    const error = new Error("Interacción no encontrada.");
    error.status = 404;
    throw error;
  }
  return resultado.rows[0];
}

module.exports = {
  generarEmbedding,
  chatConNexia,
  obtenerRecomendaciones,
  obtenerRecomendacionesParaUsuario,
  mejorarDescripcionEmprendimiento,
  calificarInteraccion,
};
