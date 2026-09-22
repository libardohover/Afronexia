import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home.jsx";
import Login from "../pages/Login.jsx";
import Registro from "../pages/Registro.jsx";
import Catalogo from "../pages/Catalogo.jsx";
import Mapa from "../pages/Mapa.jsx";
import DetalleEmprendimiento from "../pages/DetalleEmprendimiento.jsx";
import DetalleEvento from "../pages/DetalleEvento.jsx";
import DetalleContenido from "../pages/DetalleContenido.jsx";
import PerfilEmprendedor from "../pages/PerfilEmprendedor.jsx";
import GestionCultural from "../pages/GestionCultural.jsx";
import DashboardAdmin from "../pages/DashboardAdmin.jsx";
import RutaProtegida from "../components/RutaProtegida.jsx";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />
      <Route path="/catalogo" element={<Catalogo />} />
      <Route path="/mapa" element={<Mapa />} />
      <Route path="/emprendimiento/:id" element={<DetalleEmprendimiento />} />
      <Route path="/evento/:id" element={<DetalleEvento />} />
      <Route path="/contenido/:id" element={<DetalleContenido />} />
      <Route
        path="/mi-emprendimiento"
        element={
          <RutaProtegida roles={["emprendedor", "administrador"]}>
            <PerfilEmprendedor />
          </RutaProtegida>
        }
      />
      <Route
        path="/gestion-cultural"
        element={
          <RutaProtegida roles={["gestor_cultural", "administrador"]}>
            <GestionCultural />
          </RutaProtegida>
        }
      />
      <Route
        path="/admin"
        element={
          <RutaProtegida roles={["administrador"]}>
            <DashboardAdmin />
          </RutaProtegida>
        }
      />
    </Routes>
  );
}
