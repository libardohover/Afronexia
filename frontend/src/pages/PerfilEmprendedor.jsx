import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext.jsx";

const FORM_VACIO = { nombre: "", categoria: "", descripcion: "", ubicacion: "", contacto: "", latitud: "", longitud: "" };

// HU-05, HU-06: registrar y gestionar la información del propio emprendimiento.
export default function PerfilEmprendedor() {
  const { usuario } = useAuth();
  const [propios, setPropios] = useState([]);
  const [form, setForm] = useState(FORM_VACIO);
  const [mensaje, setMensaje] = useState("");

  // Sprint 4 — "Mejorar con IA" (valor agregado, Objetivo 4)
  const [mejorando, setMejorando] = useState(false);
  const [errorIA, setErrorIA] = useState("");

  function cargar() {
    api.get("/emprendimientos").then(({ data }) => {
      setPropios(data.filter((e) => e.usuario_id === usuario.id));
    });
  }

  useEffect(cargar, [usuario.id]);

  function actualizarCampo(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  async function manejarEnvio(e) {
    e.preventDefault();
    setMensaje("");
    if (!form.nombre || !form.categoria || !form.descripcion) {
      setMensaje("Nombre, categoría y descripción son obligatorios.");
      return;
    }
    try {
      await api.post("/emprendimientos", {
        ...form,
        latitud: form.latitud ? Number(form.latitud) : null,
        longitud: form.longitud ? Number(form.longitud) : null,
      });
      setForm(FORM_VACIO);
      cargar();
    } catch (err) {
      setMensaje(err.response?.data?.error || "No se pudo guardar.");
    }
  }

  // Toma lo que el emprendedor ya escribió en "descripción" y lo mejora con IA,
  // reemplazando el campo con el texto sugerido (el emprendedor puede seguir editándolo).
  async function mejorarConIA() {
    if (!form.descripcion.trim()) {
      setErrorIA("Escribe primero una idea breve en la descripción.");
      return;
    }
    setMejorando(true);
    setErrorIA("");
    try {
      const { data } = await api.post("/ia/optimizar-texto", { borrador: form.descripcion, categoria: form.categoria });
      actualizarCampo("descripcion", data.textoMejorado.trim());
    } catch (err) {
      setErrorIA(err.response?.data?.error || "No se pudo mejorar el texto en este momento.");
    } finally {
      setMejorando(false);
    }
  }

  return (
    <div className="contenedor" style={{ padding: "32px 24px", maxWidth: 640 }}>
      <h1 style={{ fontSize: 24 }}>Mi emprendimiento</h1>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {propios.map((item) => (
          <div key={item.id} className="tarjeta">
            <strong>{item.nombre}</strong> — {item.categoria}
          </div>
        ))}
        {propios.length === 0 && <p style={{ color: "var(--color-texto-secundario)" }}>Aún no has registrado ningún emprendimiento.</p>}
      </div>

      <h2 style={{ fontSize: 18, marginTop: 28 }}>Registrar nuevo</h2>
      <form onSubmit={manejarEnvio} style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 420 }}>
        <input placeholder="Nombre" value={form.nombre} onChange={(e) => actualizarCampo("nombre", e.target.value)} />
        <input placeholder="Categoría (ej. Gastronomía)" value={form.categoria} onChange={(e) => actualizarCampo("categoria", e.target.value)} />

        <textarea
          placeholder="Descripción (puedes escribir solo una idea breve y luego mejorarla con IA)"
          rows={3}
          value={form.descripcion}
          onChange={(e) => actualizarCampo("descripcion", e.target.value)}
        />
        <div>
          <button
            type="button"
            onClick={mejorarConIA}
            disabled={mejorando}
            className="boton-secundario"
            style={{ fontSize: 13, padding: "6px 14px" }}
          >
            {mejorando ? "Mejorando..." : "✨ Mejorar con IA"}
          </button>
          {errorIA && <p style={{ color: "#c62828", fontSize: 13, marginTop: 6 }}>{errorIA}</p>}
        </div>

        <input placeholder="Ubicación" value={form.ubicacion} onChange={(e) => actualizarCampo("ubicacion", e.target.value)} />
        <div style={{ display: "flex", gap: 10 }}>
          <input
            placeholder="Latitud (ej. 7.0653)"
            value={form.latitud}
            onChange={(e) => actualizarCampo("latitud", e.target.value)}
            style={{ flex: 1 }}
          />
          <input
            placeholder="Longitud (ej. -73.8547)"
            value={form.longitud}
            onChange={(e) => actualizarCampo("longitud", e.target.value)}
            style={{ flex: 1 }}
          />
        </div>
        <p style={{ fontSize: 12, color: "var(--color-texto-secundario)", margin: "-4px 0 0" }}>
          La latitud y longitud son opcionales, pero se necesitan para aparecer en el Mapa.
        </p>
        <input placeholder="Contacto" value={form.contacto} onChange={(e) => actualizarCampo("contacto", e.target.value)} />
        {mensaje && <p style={{ color: "#c62828", fontSize: 14 }}>{mensaje}</p>}
        <button type="submit" className="boton-primario" style={{ color: "white" }}>
          Guardar
        </button>
      </form>
    </div>
  );
}
