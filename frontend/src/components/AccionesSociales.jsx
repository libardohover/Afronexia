import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext.jsx";

// HU-08 (favoritos) + HU-09 (valoraciones), aplicable a emprendimiento, evento o contenido.
export default function AccionesSociales({ entidadTipo, entidadId }) {
  const { usuario } = useAuth();
  const [esFavorito, setEsFavorito] = useState(false);
  const [favoritoId, setFavoritoId] = useState(null);
  const [cargandoFavorito, setCargandoFavorito] = useState(false);

  const [resumen, setResumen] = useState({ promedio: null, total: 0, valoraciones: [] });
  const [puntuacion, setPuntuacion] = useState(0);
  const [comentario, setComentario] = useState("");
  const [enviandoValoracion, setEnviandoValoracion] = useState(false);
  const [mensaje, setMensaje] = useState("");

  function cargarValoraciones() {
    api.get("/valoraciones", { params: { entidad_tipo: entidadTipo, entidad_id: entidadId } }).then(({ data }) => setResumen(data));
  }

  useEffect(() => {
    cargarValoraciones();
    if (usuario) {
      api
        .get("/favoritos/estado", { params: { entidad_tipo: entidadTipo, entidad_id: entidadId } })
        .then(({ data }) => {
          setEsFavorito(data.esFavorito);
          setFavoritoId(data.favoritoId);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entidadTipo, entidadId, usuario]);

  async function alternarFavorito() {
    if (!usuario || cargandoFavorito) return;
    setCargandoFavorito(true);
    try {
      if (esFavorito && favoritoId) {
        await api.delete(`/favoritos/${favoritoId}`);
        setEsFavorito(false);
        setFavoritoId(null);
      } else {
        const { data } = await api.post("/favoritos", { entidad_tipo: entidadTipo, entidad_id: entidadId });
        setEsFavorito(true);
        setFavoritoId(data.id || data.favoritoId);
      }
    } finally {
      setCargandoFavorito(false);
    }
  }

  async function enviarValoracion(e) {
    e.preventDefault();
    if (puntuacion < 1) {
      setMensaje("Selecciona de 1 a 5 estrellas.");
      return;
    }
    setEnviandoValoracion(true);
    setMensaje("");
    try {
      await api.post("/valoraciones", { entidad_tipo: entidadTipo, entidad_id: entidadId, puntuacion, comentario });
      setComentario("");
      cargarValoraciones();
      setMensaje("¡Gracias por tu valoración!");
    } catch (err) {
      setMensaje(err.response?.data?.error || "No se pudo enviar la valoración.");
    } finally {
      setEnviandoValoracion(false);
    }
  }

  return (
    <div className="tarjeta" style={{ marginTop: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div>
          {resumen.total > 0 ? (
            <span style={{ fontWeight: "bold" }}>
              {"★".repeat(Math.round(resumen.promedio))}
              {"☆".repeat(5 - Math.round(resumen.promedio))} {resumen.promedio} ({resumen.total} valoración{resumen.total !== 1 ? "es" : ""})
            </span>
          ) : (
            <span style={{ color: "var(--color-texto-secundario)", fontSize: 14 }}>Aún sin valoraciones</span>
          )}
        </div>
        {usuario && (
          <button
            onClick={alternarFavorito}
            disabled={cargandoFavorito}
            className="boton-secundario"
            style={{ padding: "6px 14px", fontSize: 13 }}
          >
            {esFavorito ? "★ En favoritos" : "☆ Guardar en favoritos"}
          </button>
        )}
      </div>

      {usuario && (
        <form onSubmit={enviarValoracion} style={{ borderTop: "1px solid var(--color-borde)", paddingTop: 12, marginBottom: 12 }}>
          <p style={{ fontSize: 13, fontWeight: "bold", margin: "0 0 6px" }}>Deja tu valoración</p>
          <div style={{ marginBottom: 8 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <span
                key={n}
                onClick={() => setPuntuacion(n)}
                style={{ cursor: "pointer", fontSize: 22, color: n <= puntuacion ? "var(--color-naranja)" : "#ccc" }}
              >
                ★
              </span>
            ))}
          </div>
          <textarea
            rows={2}
            placeholder="Comparte tu experiencia (opcional)"
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            style={{ width: "100%", marginBottom: 8 }}
          />
          {mensaje && <p style={{ fontSize: 13, color: mensaje.startsWith("¡") ? "var(--color-verde)" : "#c62828" }}>{mensaje}</p>}
          <button type="submit" className="boton-primario" style={{ color: "white" }} disabled={enviandoValoracion}>
            {enviandoValoracion ? "Enviando..." : "Enviar valoración"}
          </button>
        </form>
      )}

      {resumen.valoraciones.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {resumen.valoraciones.map((v) => (
            <div key={v.id} style={{ borderTop: "1px solid var(--color-borde)", paddingTop: 8 }}>
              <p style={{ margin: 0, fontSize: 13 }}>
                <strong>{v.usuario_nombre}</strong> — {"★".repeat(v.puntuacion)}
                {"☆".repeat(5 - v.puntuacion)}
              </p>
              {v.comentario && <p style={{ margin: "2px 0 0", fontSize: 13, color: "var(--color-texto-secundario)" }}>{v.comentario}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
