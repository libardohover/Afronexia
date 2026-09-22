const service = require("../services/favoritos.service");

async function agregar(req, res, next) {
  try {
    const { entidad_tipo, entidad_id } = req.body;
    if (!entidad_tipo || !entidad_id) {
      return res.status(400).json({ error: "entidad_tipo y entidad_id son obligatorios." });
    }
    res.status(201).json(await service.agregar(req.usuario.id, { entidad_tipo, entidad_id }));
  } catch (error) { next(error); }
}
async function listar(req, res, next) {
  try { res.json(await service.listar(req.usuario.id)); } catch (error) { next(error); }
}
async function eliminar(req, res, next) {
  try {
    const eliminado = await service.eliminar(req.params.id, req.usuario.id);
    if (!eliminado) return res.status(404).json({ error: "Favorito no encontrado." });
    res.status(204).send();
  } catch (error) { next(error); }
}
async function estado(req, res, next) {
  try {
    const { entidad_tipo, entidad_id } = req.query;
    service.validarTipo(entidad_tipo);
    const favorito = await service.estaEnFavoritos(req.usuario.id, entidad_tipo, entidad_id);
    res.json({ esFavorito: !!favorito, favoritoId: favorito?.id || null });
  } catch (error) { next(error); }
}

module.exports = { agregar, listar, eliminar, estado };
