import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { usuario, cerrarSesion } = useAuth();

  return (
    <header style={{ borderBottom: "1px solid var(--color-borde)", background: "white" }}>
      <nav
        className="contenedor"
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px" }}
      >
        <Link to="/" style={{ fontWeight: "bold", fontSize: 20, color: "var(--color-verde)" }}>
          AFRONEXIA
        </Link>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <Link to="/catalogo">Explorar</Link>
          <Link to="/mapa">Mapa</Link>
          {usuario?.rol === "administrador" && <Link to="/admin">Dashboard</Link>}
          {(usuario?.rol === "emprendedor" || usuario?.rol === "administrador") && (
            <Link to="/mi-emprendimiento">Mi emprendimiento</Link>
          )}
          {(usuario?.rol === "gestor_cultural" || usuario?.rol === "administrador") && (
            <Link to="/gestion-cultural">Gestión cultural</Link>
          )}
          {usuario ? (
            <button className="boton-secundario" onClick={cerrarSesion}>
              Cerrar sesión
            </button>
          ) : (
            <Link to="/login" className="boton-primario" style={{ color: "white" }}>
              Iniciar sesión
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
