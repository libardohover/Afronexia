import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext.jsx";

const FORM_CONTENIDO_VACIO = { titulo: "", categoria: "", descripcion: "", ubicacion: "" };
const FORM_EVENTO_VACIO = { titulo: "", categoria: "", descripcion: "", ubicacion: "", fecha_inicio: "", latitud: "", longitud: "" };

// HU-12: registrar contenidos culturales · HU-13: administrar eventos.
export default function GestionCultural() {
  const { usuario } = useAuth();
  const [pestana, setPestana] = useState("contenidos");

  const [contenidos, setContenidos] = useState([]);
  const [formContenido, setFormContenido] = useState(FORM_CONTENIDO_VACIO);
  const [errorContenido, setErrorContenido] = useState("");

  const [eventos, setEventos] = useState([]);
  const [formEvento, setFormEvento] = useState(FORM_EVENTO_VACIO);
  const [errorEvento, setErrorEvento] = useState("");

  function cargarContenidos() {
    api.get("/contenidos").then(({ data }) => setContenidos(data.filter((c) => c.autor_id === usuario.id)));
  }
  function cargarEventos() {
    api.get("/eventos").then(({ data }) => setEventos(data.filter((e) => e.organizador_id === usuario.id)));
  }

  useEffect(() => {
    cargarContenidos();
    cargarEventos();
  }, [usuario.id]);

  async function guardarContenido(e) {
    e.preventDefault();
    setErrorContenido("");
    if (!formContenido.titulo || !formContenido.categoria || !formContenido.descripcion) {
      setErrorContenido("Título, categoría y descripción son obligatorios.");
      return;
    }
    try {
      await api.post("/contenidos", formContenido);
      setFormContenido(FORM_CONTENIDO_VACIO);
      cargarContenidos();
    } catch (err) {
      setErrorContenido(err.response?.data?.error || "No se pudo guardar el contenido.");
    }
  }

  async function guardarEvento(e) {
    e.preventDefault();
    setErrorEvento("");
    if (!formEvento.titulo || !formEvento.descripcion || !formEvento.fecha_inicio) {
      setErrorEvento("Título, descripción y fecha de inicio son obligatorios.");
      return;
    }
    try {
      await api.post("/eventos", {
        ...formEvento,
        fecha_inicio: new Date(formEvento.fecha_inicio).toISOString(),
        latitud: formEvento.latitud ? Number(formEvento.latitud) : null,
        longitud: formEvento.longitud ? Number(formEvento.longitud) : null,
      });
      setFormEvento(FORM_EVENTO_VACIO);
      cargarEventos();
    } catch (err) {
      setErrorEvento(err.response?.data?.error || "No se pudo guardar el evento.");
    }
  }

  return (
    <div className="contenedor" style={{ padding: "32px 24px", maxWidth: 640 }}>
      <h1 style={{ fontSize: 24 }}>Gestión cultural</h1>

      <div style={{ display: "flex", gap: 8, margin: "16px 0 24px" }}>
        <button
          onClick={() => setPestana("contenidos")}
          className={pestana === "contenidos" ? "boton-primario" : "boton-secundario"}
          style={pestana === "contenidos" ? { color: "white" } : {}}
        >
          Contenidos culturales
        </button>
        <button
          onClick={() => setPestana("eventos")}
          className={pestana === "eventos" ? "boton-primario" : "boton-secundario"}
          style={pestana === "eventos" ? { color: "white" } : {}}
        >
          Eventos
        </button>
      </div>

      {pestana === "contenidos" && (
        <div>
          <div className="stack" style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
            {contenidos.map((c) => (
              <div key={c.id} className="tarjeta">
                <strong>{c.titulo}</strong> — {c.categoria}
              </div>
            ))}
            {contenidos.length === 0 && <p style={{ color: "var(--color-texto-secundario)" }}>Aún no has registrado contenidos.</p>}
          </div>

          <h2 style={{ fontSize: 18 }}>Registrar contenido cultural</h2>
          <form onSubmit={guardarContenido} style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 420 }}>
            <input
              placeholder="Título (ej. Festival del Bunde)"
              value={formContenido.titulo}
              onChange={(e) => setFormContenido((f) => ({ ...f, titulo: e.target.value }))}
            />
            <input
              placeholder="Categoría (Música, Gastronomía, Patrimonio...)"
              value={formContenido.categoria}
              onChange={(e) => setFormContenido((f) => ({ ...f, categoria: e.target.value }))}
            />
            <textarea
              placeholder="Descripción"
              rows={3}
              value={formContenido.descripcion}
              onChange={(e) => setFormContenido((f) => ({ ...f, descripcion: e.target.value }))}
            />
            <input
              placeholder="Ubicación"
              value={formContenido.ubicacion}
              onChange={(e) => setFormContenido((f) => ({ ...f, ubicacion: e.target.value }))}
            />
            {errorContenido && <p style={{ color: "#c62828", fontSize: 14 }}>{errorContenido}</p>}
            <button type="submit" className="boton-primario" style={{ color: "white", width: 140 }}>
              Guardar
            </button>
          </form>
        </div>
      )}

      {pestana === "eventos" && (
        <div>
          <div className="stack" style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
            {eventos.map((ev) => (
              <div key={ev.id} className="tarjeta">
                <strong>{ev.titulo}</strong> — {new Date(ev.fecha_inicio).toLocaleDateString("es-CO")}
              </div>
            ))}
            {eventos.length === 0 && <p style={{ color: "var(--color-texto-secundario)" }}>Aún no has registrado eventos.</p>}
          </div>

          <h2 style={{ fontSize: 18 }}>Registrar evento</h2>
          <form onSubmit={guardarEvento} style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 420 }}>
            <input
              placeholder="Título del evento"
              value={formEvento.titulo}
              onChange={(e) => setFormEvento((f) => ({ ...f, titulo: e.target.value }))}
            />
            <textarea
              placeholder="Descripción"
              rows={3}
              value={formEvento.descripcion}
              onChange={(e) => setFormEvento((f) => ({ ...f, descripcion: e.target.value }))}
            />
            <input
              placeholder="Ubicación"
              value={formEvento.ubicacion}
              onChange={(e) => setFormEvento((f) => ({ ...f, ubicacion: e.target.value }))}
            />
            <div style={{ display: "flex", gap: 10 }}>
              <input
                placeholder="Latitud (ej. 7.0653)"
                value={formEvento.latitud}
                onChange={(e) => setFormEvento((f) => ({ ...f, latitud: e.target.value }))}
                style={{ flex: 1 }}
              />
              <input
                placeholder="Longitud (ej. -73.8547)"
                value={formEvento.longitud}
                onChange={(e) => setFormEvento((f) => ({ ...f, longitud: e.target.value }))}
                style={{ flex: 1 }}
              />
            </div>
            <label style={{ fontSize: 12, color: "var(--color-texto-secundario)" }}>
              Fecha y hora de inicio
              <input
                type="datetime-local"
                value={formEvento.fecha_inicio}
                onChange={(e) => setFormEvento((f) => ({ ...f, fecha_inicio: e.target.value }))}
                style={{ display: "block", marginTop: 4 }}
              />
            </label>
            {errorEvento && <p style={{ color: "#c62828", fontSize: 14 }}>{errorEvento}</p>}
            <button type="submit" className="boton-primario" style={{ color: "white", width: 140 }}>
              Guardar
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
