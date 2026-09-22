import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Link } from "react-router-dom";
import api from "../services/api";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Vite no resuelve los íconos por defecto de Leaflet automáticamente; se registran a mano.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: markerIcon2x, iconUrl: markerIcon, shadowUrl: markerShadow });

const BARRANCABERMEJA = [7.0653, -73.8547];

// HU-07: consultar la ubicación de emprendimientos y eventos en un mapa (RF-08).
export default function Mapa() {
  const [puntos, setPuntos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/emprendimientos"), api.get("/eventos")])
      .then(([empRes, evtRes]) => {
        const emprendimientos = empRes.data
          .filter((e) => e.latitud && e.longitud)
          .map((e) => ({ ...e, tipo: "emprendimiento", titulo: e.nombre, ruta: `/emprendimiento/${e.id}` }));
        const eventos = evtRes.data
          .filter((e) => e.latitud && e.longitud)
          .map((e) => ({ ...e, tipo: "evento", titulo: e.titulo, ruta: `/evento/${e.id}` }));
        setPuntos([...emprendimientos, ...eventos]);
      })
      .finally(() => setCargando(false));
  }, []);

  return (
    <div className="contenedor" style={{ padding: "32px 24px" }}>
      <h1 style={{ fontSize: 24, marginBottom: 4 }}>Mapa de la oferta cultural y turística</h1>
      <p style={{ color: "var(--color-texto-secundario)", marginTop: 0, fontSize: 14 }}>
        {cargando ? "Cargando ubicaciones..." : `${puntos.length} lugar${puntos.length !== 1 ? "es" : ""} con ubicación registrada`}
      </p>

      {!cargando && puntos.length === 0 && (
        <p style={{ color: "var(--color-texto-secundario)" }}>
          Todavía no hay emprendimientos ni eventos con coordenadas registradas.
        </p>
      )}

      <div style={{ height: 480, borderRadius: 10, overflow: "hidden", border: "1px solid var(--color-borde)" }}>
        <MapContainer center={BARRANCABERMEJA} zoom={13} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {puntos.map((p) => (
            <Marker key={`${p.tipo}-${p.id}`} position={[p.latitud, p.longitud]}>
              <Popup>
                <strong>{p.titulo}</strong>
                <br />
                {p.categoria || "Evento"}
                <br />
                <Link to={p.ruta}>Ver detalle</Link>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
