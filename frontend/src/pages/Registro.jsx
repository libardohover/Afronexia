import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

// HU-02: registrarse para acceder a funcionalidades personalizadas.
export default function Registro() {
  const [form, setForm] = useState({ nombre: "", email: "", password: "" });
  const [error, setError] = useState("");
  const { registrarse } = useAuth();
  const navigate = useNavigate();

  function actualizarCampo(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  async function manejarEnvio(e) {
    e.preventDefault();
    setError("");
    if (!form.nombre || !form.email || !form.password) {
      setError("Todos los campos son obligatorios.");
      return;
    }
    if (form.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    try {
      await registrarse(form);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo completar el registro.");
    }
  }

  return (
    <div className="contenedor" style={{ maxWidth: 380, padding: "48px 24px" }}>
      <h1 style={{ fontSize: 24 }}>Crear cuenta</h1>
      <form onSubmit={manejarEnvio} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input placeholder="Nombre completo" value={form.nombre} onChange={(e) => actualizarCampo("nombre", e.target.value)} />
        <input type="email" placeholder="Correo electrónico" value={form.email} onChange={(e) => actualizarCampo("email", e.target.value)} />
        <input
          type="password"
          placeholder="Contraseña (mínimo 8 caracteres)"
          value={form.password}
          onChange={(e) => actualizarCampo("password", e.target.value)}
        />
        {error && <p style={{ color: "#c62828", fontSize: 14 }}>{error}</p>}
        <button type="submit" className="boton-primario" style={{ color: "white" }}>
          Registrarme
        </button>
      </form>
      <p style={{ marginTop: 12, fontSize: 14 }}>
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
      </p>
    </div>
  );
}
