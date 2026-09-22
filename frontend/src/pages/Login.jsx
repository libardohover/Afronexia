import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

// HU-03: iniciar sesión.
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  async function manejarEnvio(e) {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Ingresa tu correo y contraseña.");
      return;
    }
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo iniciar sesión.");
    }
  }

  return (
    <div className="contenedor" style={{ maxWidth: 380, padding: "48px 24px" }}>
      <h1 style={{ fontSize: 24 }}>Iniciar sesión</h1>
      <form onSubmit={manejarEnvio} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input type="email" placeholder="Correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p style={{ color: "#c62828", fontSize: 14 }}>{error}</p>}
        <button type="submit" className="boton-primario" style={{ color: "white" }}>
          Entrar
        </button>
      </form>
      <p style={{ marginTop: 12, fontSize: 14 }}>
        ¿No tienes cuenta? <Link to="/registro">Regístrate</Link>
      </p>
    </div>
  );
}
