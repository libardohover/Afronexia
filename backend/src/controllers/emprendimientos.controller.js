const service = require("../services/emprendimientos.service");

async function listar(req, res, next) {
  try {
    const { categoria, buscar } = req.query;
    const emprendimientos = await service.listar({ categoria, buscar });
    res.json(emprendimientos);
  } catch (error) {
    next(error);
  }
}

async function obtener(req, res, next) {
  try {
    const emprendimiento = await service.obtenerPorId(req.params.id);
    if (!emprendimiento) {
      return res.status(404).json({ error: "Emprendimiento no encontrado." });
    }
    res.json(emprendimiento);
  } catch (error) {
    next(error);
  }
}

async function crear(req, res, next) {
  try {
    const { nombre, categoria, descripcion } = req.body;
    if (!nombre || !categoria || !descripcion) {
      return res.status(400).json({ error: "Nombre, categoría y descripción son obligatorios." });
    }
    const nuevo = await service.crear(req.usuario.id, req.body);
    res.status(201).json(nuevo);
  } catch (error) {
    next(error);
  }
}

async function actualizar(req, res, next) {
  try {
    const actualizado = await service.actualizar(req.params.id, req.usuario.id, req.usuario.rol, req.body);
    if (!actualizado) {
      return res.status(404).json({ error: "Emprendimiento no encontrado." });
    }
    res.json(actualizado);
  } catch (error) {
    next(error);
  }
}

async function eliminar(req, res, next) {
  try {
    const eliminado = await service.eliminar(req.params.id, req.usuario.id, req.usuario.rol);
    if (!eliminado) {
      return res.status(404).json({ error: "Emprendimiento no encontrado." });
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
