-- ============================================================
-- El Sacamuelas — esquema de la tabla de ranking
-- Corre esto UNA sola vez en Neon:
--   Neon dashboard → tu proyecto → "SQL Editor" → pega esto → Run
-- ============================================================

CREATE TABLE IF NOT EXISTS scores (
  id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name         TEXT        NOT NULL,          -- nombre del jugador
  country      TEXT        NOT NULL,          -- código de país de 2 letras, ej: 'mx'
  patients     INTEGER     NOT NULL,          -- pacientes atendidos (mayor = mejor)
  time_ms      BIGINT      NOT NULL,          -- tiempo de la racha en milisegundos (menor = desempata mejor)
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índice que hace rápido el ranking:
-- primero por más pacientes, luego por menos tiempo (el desempate que pediste).
CREATE INDEX IF NOT EXISTS scores_ranking_idx
  ON scores (patients DESC, time_ms ASC);
