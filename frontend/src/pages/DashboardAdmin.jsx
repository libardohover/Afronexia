// RF-13, RF-16: se conecta a /api/dashboard/* a partir del sprint 5.
export default function DashboardAdmin() {
  return (
    <div className="contenedor" style={{ padding: "32px 24px" }}>
      <h1 style={{ fontSize: 24 }}>Dashboard administrativo</h1>
      <p style={{ color: "var(--color-texto-secundario)" }}>
        Los indicadores de uso, contenidos e interacciones con IA se implementan en el sprint 5,
        una vez existan datos reales para mostrar.
      </p>
    </div>
  );
}
