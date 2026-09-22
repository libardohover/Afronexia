const service = require("../services/ia.service");

// POST /api/ia/chat — HU-10, RF-11
async function chat(req, res, next) {
  try {
    const { mensaje } = req.body;
    if (!mensaje) {
      return res.status(400).json({ error: "El mensaje es obligatorio." });
    }
    // req.usuario existe solo si el visitante inició sesión (ruta pública,
    // ver ia.routes.js); NEXIA funciona igual para visitantes anónimos.
    const usuarioId = req.usuario?.id || null;
    const resultado = await service.chatConNexia(mensaje, usuarioId);
    res.json(resultado);
  } catch (error) {
    next(error);
  }
}

// GET /api/ia/recomendaciones — HU-11, RF-12
// Usuario autenticado: usa sus preferencias guardadas. Sin sesión: usa
// el parámetro ?preferencias= si lo envía, o un perfil general.
async function recomendar(req, res, next) {
  try {
    let recomendaciones;
    if (req.usuario?.id) {
      recomendaciones = await service.obtenerRecomendacionesParaUsuario(req.usuario.id);
    } else {
      recomendaciones = await service.obtenerRecomendaciones(req.query.preferencias || "");
    }
    res.json({ recomendaciones });
  } catch (error) {
    next(error);
  }
}

// POST /api/ia/optimizar-texto — valor agregado, Objetivo 4 (emprendedores)
async function optimizarTexto(req, res, next) {
  try {
    const { borrador, categoria } = req.body;
    const textoMejorado = await service.mejorarDescripcionEmprendimiento(borrador, categoria);
    res.json({ textoMejorado });
  } catch (error) {
    next(error);
  }
}

// POST /api/ia/interacciones/:id/calificar — feedback del usuario (RF-19)
async function calificar(req, res, next) {
  try {
    const { calificacion } = req.body;
    const resultado = await service.calificarInteraccion(Number(req.params.id), Number(calificacion));
    res.json(resultado);
  } catch (error) {
    next(error);
  }
}

module.exports = { chat, recomendar, optimizarTexto, calificar };
