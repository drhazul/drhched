#!/usr/bin/env bash
set -euo pipefail

echo "[entrypoint] NODE_ENV=${NODE_ENV:-}"
echo "[entrypoint] Esperando a la base de datos (db:5432) usando /dev/tcp ..."
# Espera a que el puerto 5432 de 'db' acepte conexiones (sin depender de 'nc')
until bash -c "</dev/tcp/db/5432" 2>/dev/null; do
  echo "[entrypoint] DB no disponible aún, reintentando en 2s..."
  sleep 2
done
echo "[entrypoint] DB accesible."

# Genera Prisma Client (seguro e idempotente; útil si actualizas prisma/schema.prisma)
echo "[entrypoint] Ejecutando 'prisma generate' (por si acaso)..."
npx prisma generate 1>/dev/null

# Aplica migraciones (idempotente en producción)
echo "[entrypoint] Ejecutando 'prisma migrate deploy'..."
npx prisma migrate deploy --schema=prisma/schema.prisma

# --------------------------------------------------------
# Seed inicial condicional (solo si no existe el admin)
# --------------------------------------------------------
if ! npx prisma db execute --command "SELECT 1 FROM \"user\" WHERE email='admin@demo.local';" --schema=prisma/schema.prisma | grep -q 1; then
  echo "[entrypoint] Ejecutando seed inicial..."
  node dist/prisma/seed.js || true
else
  echo "[entrypoint] Seed omitido (usuario admin@demo.local ya existe)"
fi
# --------------------------------------------------------

# Seleccionar el main compilado
APP_MAIN=""
if [ -f "dist/main.js" ]; then
  APP_MAIN="dist/main.js"
elif [ -f "dist/src/main.js" ]; then
  APP_MAIN="dist/src/main.js"
else
  echo "[entrypoint] No se encontró dist/main.js ni dist/src/main.js. Contenido de 'dist/':"
  ls -lah dist || true
  exit 1
fi

echo "[entrypoint] Iniciando API -> $APP_MAIN (HOST=${HOST:-0.0.0.0}, PORT=${PORT:-3000})"
exec node "$APP_MAIN"
