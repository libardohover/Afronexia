import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const RUTA_POR_FUENTE = {
  emprendimiento: "/emprendimiento",
  evento: "/evento",
  contenido: "/contenido",
};

// HU-01: página principal para conocer la oferta cultural y turística.
export default function Home() {
  // Sprint 4 — HU-11, RF-12: feed de recomendaciones (personalizado si hay sesión).
  const [recomendaciones, setRecomendaciones] = useState([]);
  const [mostrarRecomendaciones, setMostrarRecomendaciones] = useState(false);

  useEffect(() => {
    api
      .get("/ia/recomendaciones")
      .then(({ data }) => {
        if (data.recomendaciones?.length > 0) {
          setRecomendaciones(data.recomendaciones);
          setMostrarRecomendaciones(true);
        }
      })
      .catch(() => {
        // El feed de IA es una mejora, no algo crítico: si el módulo de IA
        // no está configurado (503) o falla, la página principal sigue igual.
        setMostrarRecomendaciones(false);
      });
  }, []);

  return (
    <div className="contenedor" style={{ padding: "48px 24px" }}>
      <h1 style={{ color: "var(--color-verde)", fontSize: 36 }}>
        Conectando raíces, creando experiencias
      </h1>
      <p style={{ color: "var(--color-texto-secundario)", maxWidth: 560, fontSize: 17 }}>
        Descubre la cultura, gastronomía, música y emprendimientos de la comunidad
        afrodescendiente de Barrancabermeja.
      </p>
      <Link to="/catalogo" className="boton-primario" style={{ color: "white", display: "inline-block", marginTop: 16 }}>
        Explorar la oferta
      </Link>

      {mostrarRecomendaciones && (
        <section style={{ marginTop: 48 }}>
          <h2 style={{ fontSize: 20, color: "var(--color-verde)" }}>Recomendado para ti según tus raíces e intereses</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16, marginTop: 12 }}>
            {recomendaciones.map((r) => (
              <Link
                key={`${r.fuente_tipo || "oferta"}-${r.id}`}
                to={r.fuente_tipo && r.fuente_id ? `${RUTA_POR_FUENTE[r.fuente_tipo]}/${r.fuente_id}` : "/catalogo"}
                className="tarjeta"
              >
                <p style={{ fontSize: 12, color: "var(--color-naranja)", fontWeight: "bold" }}>{r.categoria}</p>
                <h3 style={{ margin: "4px 0" }}>{r.titulo}</h3>
                <p style={{ fontSize: 13, color: "var(--color-texto-secundario)" }}>
                  {r.descripcion?.slice(0, 90)}
                  {r.descripcion?.length > 90 ? "..." : ""}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
