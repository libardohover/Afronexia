const service = require("../services/contacto.service");

async function enviar(req, res, next) {
  try {
    const { emprendimiento_id, mensaje } = req.body;
    if (!emprendimiento_id || !mensaje) {
      return res.status(400).json({ error: "El emprendimiento y el mensaje son obligatorios." });
    }
    res.status(201).json(await service.enviarMensaje(req.usuario.id, { emprendimiento_id, mensaje }));
  } catch (error) { next(error); }
}
async function recibidos(req, res, next) {
  try { res.json(await service.listarRecibidos(req.usuario.id)); } catch (error) { next(error); }
}

module.exports = { enviar, recibidos };
