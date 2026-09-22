import { createContext, useContext, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const guardado = localStorage.getItem("afronexia_usuario");
    return guardado ? JSON.parse(guardado) : null;
  });

  function guardarSesion({ usuario, token }) {
    localStorage.setItem("afronexia_token", token);
    localStorage.setItem("afronexia_usuario", JSON.stringify(usuario));
    setUsuario(usuario);
  }

  async function login(email, password) {
    const { data } = await api.post("/auth/login", { email, password });
    guardarSesion(data);
    return data.usuario;
  }

  async function registrarse(datos) {
    const { data } = await api.post("/auth/registro", datos);
    guardarSesion(data);
    return data.usuario;
  }

  function cerrarSesion() {
    localStorage.removeItem("afronexia_token");
    localStorage.removeItem("afronexia_usuario");
    setUsuario(null);
  }

  const valor = { usuario, login, registrarse, cerrarSesion };
  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
