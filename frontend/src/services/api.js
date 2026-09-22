import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

// Adjunta el token JWT guardado en el AuthContext a cada petición saliente.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("afronexia_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
