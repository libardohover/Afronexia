import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import AccionesSociales from "../components/AccionesSociales.jsx";

export default function DetalleEvento() {
  const { id } = useParams();
  const [evento, setEvento] = useState(null);

  useEffect(() => {
    api.get(`/eventos/${id}`).then(({ data }) => setEvento(data));
  }, [id]);

  if (!evento) return <div className="contenedor" style={{ padding: 32 }}>Cargando...</div>;

  const fecha = new Date(evento.fecha_inicio).toLocaleString("es-CO", {
    dateStyle: "long",
    timeStyle: "short",
  });

  return (
    <div className="contenedor" style={{ padding: "32px 24px", maxWidth: 720 }}>
      {evento.categoria && <p style={{ fontSize: 12, color: "var(--color-naranja)", fontWeight: "bold" }}>{evento.categoria}</p>}
      <h1>{evento.titulo}</h1>
      <p style={{ color: "var(--color-texto-secundario)" }}>
        {fecha}
        {evento.ubicacion ? ` · ${evento.ubicacion}` : ""}
      </p>
      <p>{evento.descripcion}</p>

      <AccionesSociales entidadTipo="evento" entidadId={Number(id)} />
    </div>
  );
}
