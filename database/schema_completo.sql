-- =====================================================================
-- AFRONEXIA — Script de creación de base de datos (completo)
-- PostgreSQL 16 con extensión pgvector
--
-- Este archivo combina, en el orden correcto de ejecución:
--   1) database/schema.sql     (núcleo del sistema)
--   2) database/schema_ia.sql  (módulo de IA — Fase 1)
--
-- Uso:
--   createdb afronexia_db
--   psql -d afronexia_db -f schema_completo.sql
-- =====================================================================


-- #######################################################################
-- PARTE 1 — NÚCLEO DEL SISTEMA (database/schema.sql)
-- #######################################################################

-- =====================================================================
-- AFRONEXIA — Esquema de base de datos (núcleo del sistema)
-- PostgreSQL 14+
-- Cubre: RF-01 a RF-10, RF-13 a RF-18, RF-20, RNF-04, RNF-05, RNF-06
-- Las tablas de IA (ofertas_culturales, ai_interaction_logs) ya fueron
-- definidas en la propuesta técnica de IA y se integran en el sprint 3-4.
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------
-- USUARIOS Y ROLES (RF-01, RF-02, RF-03, RF-15)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
    id              SERIAL PRIMARY KEY,
    nombre          VARCHAR(150) NOT NULL,
    email           VARCHAR(150) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    rol             VARCHAR(30) NOT NULL DEFAULT 'usuario'
                    CHECK (rol IN ('usuario', 'emprendedor', 'gestor_cultural', 'administrador')),
    telefono        VARCHAR(30),
    preferencias    JSONB DEFAULT '[]',      -- etiquetas de interés (RF-12): ["Gastronomía","Danza",...]
    activo          BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_registro  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios (rol);

-- ---------------------------------------------------------------------
-- CONTENIDOS CULTURALES (RF-04) — a cargo de gestores culturales
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contenidos_culturales (
    id              SERIAL PRIMARY KEY,
    autor_id        INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    titulo          VARCHAR(200) NOT NULL,
    categoria       VARCHAR(60)  NOT NULL,
    descripcion     TEXT NOT NULL,
    ubicacion       VARCHAR(255),
    latitud         NUMERIC(9,6),
    longitud        NUMERIC(9,6),
    imagen_url      VARCHAR(500),
    publicado       BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_contenidos_categoria ON contenidos_culturales (categoria);

-- ---------------------------------------------------------------------
-- EMPRENDIMIENTOS (RF-05, RF-18) — productos/servicios/experiencias
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS emprendimientos (
    id              SERIAL PRIMARY KEY,
    usuario_id      INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nombre          VARCHAR(150) NOT NULL,
    categoria       VARCHAR(60)  NOT NULL,
    descripcion     TEXT NOT NULL,
    ubicacion       VARCHAR(255),
    latitud         NUMERIC(9,6),
    longitud        NUMERIC(9,6),
    contacto        VARCHAR(100),
    imagenes        JSONB DEFAULT '[]',
    publicado       BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_emprendimientos_categoria ON emprendimientos (categoria);
CREATE INDEX IF NOT EXISTS idx_emprendimientos_usuario ON emprendimientos (usuario_id);

-- ---------------------------------------------------------------------
-- EVENTOS (RF-06) — a cargo de gestores culturales
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS eventos (
    id              SERIAL PRIMARY KEY,
    organizador_id  INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    titulo          VARCHAR(200) NOT NULL,
    categoria       VARCHAR(60),
    descripcion     TEXT NOT NULL,
    ubicacion       VARCHAR(255),
    latitud         NUMERIC(9,6),
    longitud        NUMERIC(9,6),
    fecha_inicio    TIMESTAMP NOT NULL,
    fecha_fin       TIMESTAMP,
    publicado       BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_eventos_fecha ON eventos (fecha_inicio);

-- ---------------------------------------------------------------------
-- VALORACIONES (RF-09) — polimórfica: aplica a emprendimiento, evento o contenido
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS valoraciones (
    id              SERIAL PRIMARY KEY,
    usuario_id      INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    entidad_tipo    VARCHAR(20) NOT NULL CHECK (entidad_tipo IN ('emprendimiento','evento','contenido')),
    entidad_id      INTEGER NOT NULL,
    puntuacion      SMALLINT NOT NULL CHECK (puntuacion BETWEEN 1 AND 5),
    comentario      TEXT,
    creado_en       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (usuario_id, entidad_tipo, entidad_id)
);
CREATE INDEX IF NOT EXISTS idx_valoraciones_entidad ON valoraciones (entidad_tipo, entidad_id);

-- ---------------------------------------------------------------------
-- FAVORITOS (RF-10) — polimórfica
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS favoritos (
    id              SERIAL PRIMARY KEY,
    usuario_id      INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    entidad_tipo    VARCHAR(20) NOT NULL CHECK (entidad_tipo IN ('emprendimiento','evento','contenido')),
    entidad_id      INTEGER NOT NULL,
    creado_en       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (usuario_id, entidad_tipo, entidad_id)
);
CREATE INDEX IF NOT EXISTS idx_favoritos_usuario ON favoritos (usuario_id);

-- ---------------------------------------------------------------------
-- MENSAJES DE CONTACTO (RF-17) — usuario -> emprendedor
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mensajes_contacto (
    id                  SERIAL PRIMARY KEY,
    usuario_id          INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    emprendimiento_id   INTEGER NOT NULL REFERENCES emprendimientos(id) ON DELETE CASCADE,
    mensaje             TEXT NOT NULL,
    estado              VARCHAR(20) NOT NULL DEFAULT 'enviado' CHECK (estado IN ('enviado','leido','respondido')),
    creado_en           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_mensajes_emprendimiento ON mensajes_contacto (emprendimiento_id);

-- ---------------------------------------------------------------------
-- AUDITORÍA (RF-20) — acciones administrativas relevantes
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS auditoria (
    id              SERIAL PRIMARY KEY,
    usuario_id      INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    accion          VARCHAR(100) NOT NULL,
    entidad_tipo    VARCHAR(40),
    entidad_id      INTEGER,
    detalle         JSONB,
    creado_en       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_auditoria_usuario ON auditoria (usuario_id);

-- ---------------------------------------------------------------------
-- Datos semilla mínimos para desarrollo local
-- ---------------------------------------------------------------------
INSERT INTO usuarios (nombre, email, password_hash, rol)
VALUES ('Administrador AFRONEXIA', 'admin@afronexia.co', '$2b$10$reemplazar-con-hash-real', 'administrador')
ON CONFLICT (email) DO NOTHING;


-- #######################################################################
-- PARTE 2 — MÓDULO DE IA, FASE 1 (database/schema_ia.sql)
-- #######################################################################

-- =====================================================================
-- AFRONEXIA — Esquema del módulo de IA (Fase 1: preparación de datos)
-- Consistente con la Propuesta Técnica de Inteligencia Artificial.
-- Ejecutar DESPUÉS de schema.sql sobre la misma base de datos.
-- =====================================================================

-- 1. Habilitar extensión pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Tabla unificada para búsqueda semántica (RAG) de la oferta cultural.
--    Es una vista materializada "de solo lectura para NEXIA": se llena a
--    partir de emprendimientos, eventos y contenidos_culturales mediante
--    el script sincronizar_ofertas_culturales.js — no se edita a mano.
--
--    Desviación respecto a la propuesta técnica original: se agregan
--    fuente_tipo y fuente_id para saber de qué tabla y registro viene
--    cada fila, y poder sincronizar (UPSERT) sin duplicar datos cada vez
--    que se ejecute el script.
CREATE TABLE IF NOT EXISTS ofertas_culturales (
    id           SERIAL PRIMARY KEY,
    titulo       VARCHAR(255) NOT NULL,
    categoria    VARCHAR(100) NOT NULL,
    descripcion  TEXT NOT NULL,
    ubicacion    VARCHAR(255),
    contacto     VARCHAR(100),
    embedding    vector(1536),              -- generado con OpenAI text-embedding-3-small
    fuente_tipo  VARCHAR(20),                -- 'emprendimiento' | 'evento' | 'contenido'
    fuente_id    INTEGER,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (fuente_tipo, fuente_id)
);

-- Índice para acelerar la búsqueda por similitud de coseno
CREATE INDEX IF NOT EXISTS ofertas_culturales_embedding_idx
  ON ofertas_culturales USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- 3. Registro y auditoría de interacciones de IA (RF-19, RNF-17)
CREATE TABLE IF NOT EXISTS ai_interaction_logs (
    id             SERIAL PRIMARY KEY,
    user_id        INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    pregunta       TEXT NOT NULL,
    respuesta      TEXT NOT NULL,
    tokens_usados  INTEGER DEFAULT 0,
    calificacion   INTEGER CHECK (calificacion IN (1, -1)), -- 1: pulgar arriba, -1: pulgar abajo
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
