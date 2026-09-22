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
