import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext.jsx";
import AccionesSociales from "../components/AccionesSociales.jsx";

// RF-07 (detalle) + RF-17/HU-18 (contacto). Mapa (RF-08), favoritos (RF-10)
// y valoraciones (RF-09) se conectan mediante AccionesSociales.
export default function DetalleEmprendimiento() {
  const { id } = useParams();
  const { usuario } = useAuth();
  const [emprendimiento, setEmprendimiento] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [estadoEnvio, setEstadoEnvio] = useState(null); // null | "enviando" | "enviado" | "error"

  useEffect(() => {
    api.get(`/emprendimientos/${id}`).then(({ data }) => setEmprendimiento(data));
  }, [id]);

  async function enviarMensaje(e) {
    e.preventDefault();
    if (!mensaje.trim()) return;
    setEstadoEnvio("enviando");
    try {
      await api.post("/contacto", { emprendimiento_id: Number(id), mensaje });
      setEstadoEnvio("enviado");
      setMensaje("");
    } catch (err) {
      setEstadoEnvio("error");
    }
  }

  if (!emprendimiento) return <div className="contenedor" style={{ padding: 32 }}>Cargando...</div>;

  return (
    <div className="contenedor" style={{ padding: "32px 24px", maxWidth: 720 }}>
      <p style={{ fontSize: 12, color: "var(--color-naranja)", fontWeight: "bold" }}>{emprendimiento.categoria}</p>
      <h1>{emprendimiento.nombre}</h1>
      <p style={{ color: "var(--color-texto-secundario)" }}>{emprendimiento.ubicacion}</p>
      <p>{emprendimiento.descripcion}</p>

      <div className="tarjeta" style={{ marginTop: 24, maxWidth: 420 }}>
        <h3 style={{ marginTop: 0, fontSize: 16 }}>Contactar a este emprendimiento</h3>

        {!usuario && <p style={{ fontSize: 13, color: "var(--color-texto-secundario)" }}>Inicia sesión para enviar un mensaje.</p>}

        {usuario && estadoEnvio === "enviado" && (
          <p style={{ fontSize: 13, color: "var(--color-verde)" }}>Mensaje enviado. Te responderán pronto.</p>
        )}

        {usuario && estadoEnvio !== "enviado" && (
          <form onSubmit={enviarMensaje} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <textarea
              rows={3}
              placeholder="Escribe tu mensaje..."
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
            />
            {estadoEnvio === "error" && <p style={{ color: "#c62828", fontSize: 13 }}>No se pudo enviar. Intenta de nuevo.</p>}
            <button type="submit" className="boton-primario" style={{ color: "white" }} disabled={estadoEnvio === "enviando"}>
              {estadoEnvio === "enviando" ? "Enviando..." : "Enviar mensaje"}
            </button>
          </form>
        )}
      </div>

      <AccionesSociales entidadTipo="emprendimiento" entidadId={Number(id)} />
    </div>
  );
}
