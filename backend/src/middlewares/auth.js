const jwt = require("jsonwebtoken");

function verificarToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No se proporcionó un token de acceso." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = payload;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token inválido o expirado." });
  }
}

// Identifica al usuario si envía un token válido, pero nunca bloquea la
// petición: NEXIA y las recomendaciones deben funcionar igual para
// visitantes sin cuenta (RF-11 aplica a "Visitante" como actor principal).
function identificarSiHaySesion(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      req.usuario = jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET);
    } catch (error) {
      // Token inválido o vencido: se ignora, la petición sigue como anónima.
    }
  }
  next();
}

module.exports = { verificarToken, identificarSiHaySesion };
