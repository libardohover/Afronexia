import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const TIPOS = [
  { id: "emprendimientos", etiqueta: "Emprendimientos", endpoint: "/emprendimientos", ruta: "/emprendimiento" },
  { id: "eventos", etiqueta: "Eventos", endpoint: "/eventos", ruta: "/evento" },
  { id: "contenidos", etiqueta: "Cultura", endpoint: "/contenidos", ruta: "/contenido" },
];

// HU-04: buscar y filtrar contenidos, emprendimientos y eventos.
export default function Catalogo() {
  const [tipo, setTipo] = useState(TIPOS[0]);
  const [resultados, setResultados] = useState([]);
  const [buscar, setBuscar] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;
    setCargando(true);
    api
      .get(tipo.endpoint, { params: buscar ? { buscar } : {} })
      .then(({ data }) => activo && setResultados(data))
      .catch(() => activo && setResultados([]))
      .finally(() => activo && setCargando(false));
    return () => {
      activo = false;
    };
  }, [tipo, buscar]);

  return (
    <div className="contenedor" style={{ padding: "32px 24px" }}>
      <h1 style={{ fontSize: 24 }}>Explorar la oferta cultural y turística</h1>

      <div style={{ display: "flex", gap: 8, margin: "16px 0" }}>
        {TIPOS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTipo(t)}
            style={{
              border: "1px solid var(--color-verde)",
              background: tipo.id === t.id ? "var(--color-verde)" : "white",
              color: tipo.id === t.id ? "white" : "var(--color-verde)",
              borderRadius: 20,
              padding: "6px 16px",
              fontSize: 13,
              fontWeight: "bold",
            }}
          >
            {t.etiqueta}
          </button>
        ))}
      </div>

      <input
        placeholder={`Buscar en ${tipo.etiqueta.toLowerCase()}...`}
        value={buscar}
        onChange={(e) => setBuscar(e.target.value)}
        style={{ width: "100%", maxWidth: 420, marginBottom: 24 }}
      />

      {cargando && <p>Cargando...</p>}
      {!cargando && resultados.length === 0 && <p>No se encontraron resultados.</p>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
        {resultados.map((item) => (
          <Link key={item.id} to={`${tipo.ruta}/${item.id}`} className="tarjeta">
            <p style={{ fontSize: 12, color: "var(--color-naranja)", fontWeight: "bold" }}>
              {item.categoria || "Evento"}
            </p>
            <h3 style={{ margin: "4px 0" }}>{item.nombre || item.titulo}</h3>
            <p style={{ fontSize: 13, color: "var(--color-texto-secundario)" }}>
              {item.ubicacion || (item.fecha_inicio && new Date(item.fecha_inicio).toLocaleDateString("es-CO"))}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
