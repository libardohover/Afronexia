const service = require("../services/valoraciones.service");

async function crear(req, res, next) {
  try {
    const { entidad_tipo, entidad_id, puntuacion, comentario } = req.body;
    if (!entidad_tipo || !entidad_id || puntuacion === undefined) {
      return res.status(400).json({ error: "entidad_tipo, entidad_id y puntuacion son obligatorios." });
    }
    res.status(201).json(await service.crear(req.usuario.id, { entidad_tipo, entidad_id, puntuacion, comentario }));
  } catch (error) { next(error); }
}
async function listarPorEntidad(req, res, next) {
  try {
    const { entidad_tipo, entidad_id } = req.query;
    if (!entidad_tipo || !entidad_id) {
      return res.status(400).json({ error: "entidad_tipo y entidad_id son obligatorios." });
    }
    res.json(await service.listarPorEntidad(entidad_tipo, entidad_id));
  } catch (error) { next(error); }
}
async function eliminar(req, res, next) {
  try {
    const eliminada = await service.eliminar(req.params.id, req.usuario.id);
    if (!eliminada) return res.status(404).json({ error: "Valoración no encontrada." });
    res.status(204).send();
  } catch (error) { next(error); }
}

module.exports = { crear, listarPorEntidad, eliminar };
