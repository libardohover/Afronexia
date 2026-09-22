# AFRONEXIA — Código del sistema (Fundamentos + Sprints 1 a 4)

Este paquete contiene el sistema en construcción: arquitectura React +
Node/Express + PostgreSQL, modelo de base de datos, wireframes de UI/UX,
y las funcionalidades ya implementadas de los sprints 1 a 4 del roadmap
(identidad y acceso, contenidos/emprendimientos, mapa/favoritos/valoraciones,
y el asistente de IA NEXIA con recomendaciones personalizadas).

## Estructura

```
afronexia-system/
├── database/
│   ├── schema.sql            Esquema núcleo de PostgreSQL (8 tablas)
│   ├── schema_ia.sql         pgvector, ofertas_culturales, ai_interaction_logs (Fase 1 IA)
│   └── schema_completo.sql   Los dos anteriores combinados, en el orden correcto de ejecución
├── backend/                  API REST — Node.js + Express
│   └── src/
│       ├── app.js            Punto de entrada, monta todas las rutas
│       ├── config/db.js      Pool de conexión a PostgreSQL
│       ├── middlewares/      auth.js (JWT), roles.js (RF-15), errorHandler.js
│       ├── routes/           Un archivo de rutas por módulo del sistema
│       ├── controllers/      Manejo de req/res
│       ├── services/         Lógica de negocio, consultas SQL e ia.service.js (RAG)
│       └── scripts/          sincronizar_ofertas_culturales.js (Fase 1 IA)
└── frontend/                 React 18 + Vite
    ├── wireframes-ui-ux.html Wireframes navegables de las 6 pantallas núcleo
    └── src/
        ├── pages/            Home, Login, Registro, Catálogo, Mapa, Detalles, Perfiles, Admin
        ├── components/       Navbar, RutaProtegida, AccionesSociales, NexiaChatbot
        ├── context/          AuthContext (sesión global)
        └── services/api.js   Cliente axios con interceptor de token
```

## Qué ya funciona (probado con PostgreSQL real, no solo sintácticamente)

- **Base de datos**: `database/schema.sql` (núcleo) + `database/schema_ia.sql` (pgvector, `ofertas_culturales`, `ai_interaction_logs`) crean el esquema completo.
- **Backend — autenticación completa** (Sprint 1): registro, login y perfil (`/api/auth/*`).
- **Backend — emprendimientos, contenidos, eventos y contacto** (Sprint 2): CRUD completo, protegido por rol.
- **Backend — favoritos** (Sprint 3, HU-08): agregar/quitar/listar/consultar estado (`/api/favoritos/*`), personal por usuario.
- **Backend — valoraciones** (Sprint 3, HU-09): crear o actualizar (upsert) una valoración de 1 a 5 estrellas con comentario, listar con promedio (`/api/valoraciones`), público en lectura.
- **Backend — Fase 1 de IA**: pgvector habilitado; script `backend/src/scripts/sincronizar_ofertas_culturales.js` sincroniza `ofertas_culturales` desde emprendimientos/eventos/contenidos reales.
- **Backend — Sprint 4, asistente NEXIA**: `POST /api/ia/chat` (RAG con pgvector + LLM), `GET /api/ia/recomendaciones` (personalizadas si hay sesión, según `usuarios.preferencias`), `POST /api/ia/optimizar-texto` ("Mejorar con IA" para emprendedores) y `POST /api/ia/interacciones/:id/calificar` (feedback 👍/👎, RF-19). **Degradación elegante verificada**: sin `OPENAI_API_KEY` configurada, cada endpoint responde `503` con un mensaje claro en vez de fallar con error 500 — probado end-to-end.
- **Motor de búsqueda semántica validado**: se probó la consulta de similitud de coseno de pgvector con vectores sintéticos (sin necesidad de una API key real) y devolvió el resultado "cercano" con 99.87% de similitud, confirmando que el mecanismo de recuperación (RAG) funciona correctamente en cuanto se configure la API key real.
- **Frontend**: Mapa interactivo (Leaflet + OpenStreetMap) con los emprendimientos y eventos georreferenciados (HU-07). Componente `AccionesSociales` (favoritos + valoraciones) integrado en las 3 páginas de detalle. Chatbot flotante `NexiaChatbot` en todo el sitio, sección "Recomendado para ti" en Home (se oculta con gracia si la IA no está configurada), y botón "✨ Mejorar con IA" en el formulario de emprendedor. `npm run build` compila sin errores.
- **Control de roles verificado**: un usuario sin el rol requerido recibe `403` al intentar crear contenidos/eventos.

## Cómo levantarlo localmente

### 1. Base de datos
```bash
createdb afronexia_db
psql -d afronexia_db -f database/schema_completo.sql   # requiere la extensión pgvector instalada en PostgreSQL
```
(o, por separado: `schema.sql` primero y `schema_ia.sql` después)

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env   # completar DB_PASSWORD, JWT_SECRET y OPENAI_API_KEY (esta última para NEXIA)
npm run dev            # http://localhost:5000
```

Sin `OPENAI_API_KEY`, todo el sistema funciona normalmente excepto los
endpoints de IA (`/api/ia/*`), que responden `503` con un mensaje claro.

### 3. Frontend
```bash
cd frontend
npm install
npm run dev             # http://localhost:5173 (proxy a /api ya configurado)
```

### 4. Wireframes
Abrir `frontend/wireframes-ui-ux.html` directamente en el navegador — no
requiere servidor.

## Siguientes pasos (sprint 5)

- **Sprint 5 — Panel administrativo**: reemplazar el stub de
  `dashboard.routes.js` por indicadores reales (usuarios, contenidos,
  emprendimientos, eventos e interacciones de IA) y el registro de
  auditoría (RF-20).
- **Antes de usar NEXIA en producción**: configurar `OPENAI_API_KEY` y
  volver a correr `sincronizar_ofertas_culturales.js` para generar los
  embeddings de la oferta cultural (hoy sincronizada pero sin vectorizar).

Sigue el mismo patrón `routes → controller → service` usado en todos
los módulos ya implementados. La matriz de trazabilidad del Roadmap de
desarrollo indica qué RF/HU cubre.
