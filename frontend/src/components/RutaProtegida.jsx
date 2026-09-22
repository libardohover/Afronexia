import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

// Envuelve páginas que requieren sesión iniciada y, opcionalmente, un rol
// específico. Uso: <RutaProtegida roles={['administrador']}><Panel /></RutaProtegida>
export default function RutaProtegida({ children, roles }) {
  const { usuario } = useAuth();

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }
  if (roles && !roles.includes(usuario.rol)) {
    return <Navigate to="/" replace />;
  }
  return children;
}
