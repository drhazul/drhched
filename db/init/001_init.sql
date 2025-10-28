-- Esquema base
CREATE SCHEMA IF NOT EXISTS core AUTHORIZATION CURRENT_USER;

-- Rol sólo para app
DO $$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'drh_app') THEN
      CREATE ROLE drh_app LOGIN PASSWORD 'drh_app_password_ChangeMe';
   END IF;
END$$;

GRANT USAGE ON SCHEMA core TO drh_app;

-- Seguridad por defecto en el esquema
ALTER DEFAULT PRIVILEGES IN SCHEMA core
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO drh_app;

-- Tabla de control de migraciones simple (si no usamos herramienta)
CREATE TABLE IF NOT EXISTS core.migrations (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO core.migrations (name) VALUES ('001_init') ON CONFLICT DO NOTHING;
