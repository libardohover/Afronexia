const service = require("../services/eventos.service");

async function listar(req, res, next) {
  try {
    const { categoria, buscar } = req.query;
    res.json(await service.listar({ categoria, buscar }));
  } catch (error) { next(error); }
}
async function obtener(req, res, next) {
  try {
    const evento = await service.obtenerPorId(req.params.id);
    if (!evento) return res.status(404).json({ error: "Evento no encontrado." });
    res.json(evento);
  } catch (error) { next(error); }
}
async function crear(req, res, next) {
  try {
    const { titulo, descripcion, fecha_inicio } = req.body;
    if (!titulo || !descripcion || !fecha_inicio) {
      return res.status(400).json({ error: "Título, descripción y fecha de inicio son obligatorios." });
    }
    res.status(201).json(await service.crear(req.usuario.id, req.body));
  } catch (error) { next(error); }
}
async function actualizar(req, res, next) {
  try {
    const actualizado = await service.actualizar(req.params.id, req.usuario.id, req.usuario.rol, req.body);
    if (!actualizado) return res.status(404).json({ error: "Evento no encontrado." });
    res.json(actualizado);
  } catch (error) { next(error); }
}
async function eliminar(req, res, next) {
  try {
    const eliminado = await service.eliminar(req.params.id, req.usuario.id, req.usuario.rol);
    if (!eliminado) return res.status(404).json({ error: "Evento no encontrado." });
    res.status(204).send();
  } catch (error) { next(error); }
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
