const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { errorHandler } = require("./middlewares/errorHandler");

const authRoutes = require("./routes/auth.routes");
const emprendimientosRoutes = require("./routes/emprendimientos.routes");
const eventosRoutes = require("./routes/eventos.routes");
const contenidosRoutes = require("./routes/contenidos.routes");
const valoracionesRoutes = require("./routes/valoraciones.routes");
const favoritosRoutes = require("./routes/favoritos.routes");
const contactoRoutes = require("./routes/contacto.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const iaRoutes = require("./routes/ia.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/salud", (req, res) => {
  res.json({ estado: "ok", servicio: "afronexia-backend" });
});

app.use("/api/auth", authRoutes);
app.use("/api/emprendimientos", emprendimientosRoutes);
app.use("/api/eventos", eventosRoutes);
app.use("/api/contenidos", contenidosRoutes);
app.use("/api/valoraciones", valoracionesRoutes);
app.use("/api/favoritos", favoritosRoutes);
app.use("/api/contacto", contactoRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/ia", iaRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada." });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor AFRONEXIA corriendo en el puerto ${PORT}`);
});

module.exports = app;
