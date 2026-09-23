import { useEffect, useRef, useState } from "react";
import api from "../services/api";

const SALUDO_INICIAL = {
  autor: "nexia",
  texto: "¡Hola! Soy NEXIA 🌺, tu guía cultural de AFRONEXIA. ¿Qué experiencia, gastronomía o evento afrodescendiente buscas hoy en Barrancabermeja?",
};

// Fase 3 IA — HU-10, RF-11: asistente conversacional flotante, disponible
// en todo el sitio, incluso para visitantes sin sesión.
export default function NexiaChatbot() {
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState([SALUDO_INICIAL]);
  const [entrada, setEntrada] = useState("");
  const [cargando, setCargando] = useState(false);
  const finRef = useRef(null);

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes, abierto]);

  async function enviar(e) {
    e.preventDefault();
    const pregunta = entrada.trim();
    if (!pregunta || cargando) return;

    setMensajes((m) => [...m, { autor: "usuario", texto: pregunta }]);
    setEntrada("");
    setCargando(true);

    try {
      const { data } = await api.post("/ia/chat", { mensaje: pregunta });
      setMensajes((m) => [...m, { autor: "nexia", texto: data.respuesta, interaccionId: data.interaccionId }]);
    } catch (err) {
      const mensajeError = err.response?.data?.error || "Ups, ocurrió un error al conectar con NEXIA. Intenta de nuevo.";
      setMensajes((m) => [...m, { autor: "nexia", texto: mensajeError, esError: true }]);
    } finally {
      setCargando(false);
    }
  }

  async function calificar(idx, interaccionId, valor) {
    setMensajes((m) => m.map((msg, i) => (i === idx ? { ...msg, calificado: valor } : msg)));
    try {
      await api.post(`/ia/interacciones/${interaccionId}/calificar`, { calificacion: valor });
    } catch {
      // el feedback es un detalle menor: si falla, no interrumpe la conversación
    }
  }

  return (
    <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 1000, fontFamily: "inherit" }}>
      {!abierto && (
        <button
          onClick={() => setAbierto(true)}
          className="boton-primario"
          style={{ color: "white", padding: "12px 20px", borderRadius: 24, boxShadow: "0 4px 14px rgba(0,0,0,0.25)", fontSize: 14 }}
        >
          💬 Habla con NEXIA
        </button>
      )}

      {abierto && (
        <div style={{ width: 340, height: 460, background: "white", borderRadius: 14, boxShadow: "0 8px 28px rgba(0,0,0,0.3)", display: "flex", flexDirection: "column", overflow: "hidden", border: "2px solid var(--color-naranja)" }}>
          <div style={{ background: "var(--color-verde)", color: "white", padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <strong style={{ fontSize: 14 }}>NEXIA</strong>
              <div style={{ fontSize: 11, opacity: 0.85 }}>Guía cultural afrodescendiente</div>
            </div>
            <button onClick={() => setAbierto(false)} style={{ background: "none", border: "none", color: "white", fontSize: 18, cursor: "pointer" }} aria-label="Cerrar">
              ✕
            </button>
          </div>

          <div style={{ flex: 1, padding: 12, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, background: "#fafaf8" }}>
            {mensajes.map((msg, idx) => (
              <div key={idx} style={{ alignSelf: msg.autor === "usuario" ? "flex-end" : "flex-start", maxWidth: "82%" }}>
                <div
                  style={{
                    padding: "8px 12px",
                    borderRadius: 12,
                    fontSize: 13.5,
                    lineHeight: 1.4,
                    background: msg.autor === "usuario" ? "var(--color-naranja)" : msg.esError ? "#fdecea" : "var(--color-verde-claro)",
                    color: msg.autor === "usuario" ? "white" : msg.esError ? "#c62828" : "var(--color-verde)",
                  }}
                >
                  {msg.texto}
                </div>
                {msg.autor === "nexia" && msg.interaccionId && (
                  <div style={{ display: "flex", gap: 6, marginTop: 4, fontSize: 13 }}>
                    <button
                      onClick={() => calificar(idx, msg.interaccionId, 1)}
                      disabled={msg.calificado !== undefined}
                      style={{ background: "none", border: "none", cursor: "pointer", opacity: msg.calificado === 1 ? 1 : msg.calificado === -1 ? 0.3 : 0.6 }}
                      aria-label="Respuesta útil"
                    >
                      👍
                    </button>
                    <button
                      onClick={() => calificar(idx, msg.interaccionId, -1)}
                      disabled={msg.calificado !== undefined}
                      style={{ background: "none", border: "none", cursor: "pointer", opacity: msg.calificado === -1 ? 1 : msg.calificado === 1 ? 0.3 : 0.6 }}
                      aria-label="Respuesta no útil"
                    >
                      👎
                    </button>
                  </div>
                )}
              </div>
            ))}
            {cargando && <div style={{ fontSize: 12, color: "var(--color-texto-secundario)", fontStyle: "italic" }}>NEXIA está buscando la mejor recomendación...</div>}
            <div ref={finRef} />
          </div>

          <form onSubmit={enviar} style={{ display: "flex", padding: 8, borderTop: "1px solid var(--color-borde)", gap: 8 }}>
            <input
              placeholder="Pregunta por comida, música, eventos..."
              value={entrada}
              onChange={(e) => setEntrada(e.target.value)}
              style={{ flex: 1, fontSize: 13 }}
              maxLength={500}
            />
            <button type="submit" className="boton-primario" style={{ color: "white", padding: "0 14px" }} disabled={cargando}>
              Enviar
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
