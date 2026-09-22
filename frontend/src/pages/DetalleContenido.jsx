import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import AccionesSociales from "../components/AccionesSociales.jsx";

export default function DetalleContenido() {
  const { id } = useParams();
  const [contenido, setContenido] = useState(null);

  useEffect(() => {
    api.get(`/contenidos/${id}`).then(({ data }) => setContenido(data));
  }, [id]);

  if (!contenido) return <div className="contenedor" style={{ padding: 32 }}>Cargando...</div>;

  return (
    <div className="contenedor" style={{ padding: "32px 24px", maxWidth: 720 }}>
      <p style={{ fontSize: 12, color: "var(--color-naranja)", fontWeight: "bold" }}>{contenido.categoria}</p>
      <h1>{contenido.titulo}</h1>
      {contenido.ubicacion && <p style={{ color: "var(--color-texto-secundario)" }}>{contenido.ubicacion}</p>}
      <p>{contenido.descripcion}</p>

      <AccionesSociales entidadTipo="contenido" entidadId={Number(id)} />
    </div>
  );
}
