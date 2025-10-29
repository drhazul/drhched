#!/usr/bin/env bash
set -euo pipefail

echo "[entrypoint] Esperando a la base de datos (db:5432)..."
until nc -z db 5432; do
  echo "[entrypoint] Base de datos no disponible aún, reintentando..."
  sleep 2
done

echo "[entrypoint] Ejecutando prisma migrate deploy (idempotente)..."
npx prisma migrate deploy --schema=prisma/schema.prisma || true

# Seleccionar el main compilado
if [ -f "dist/main.js" ]; then
  APP_MAIN="dist/main.js"
elif [ -f "dist/src/main.js" ]; then
  APP_MAIN="dist/src/main.js"
else
  echo "[entrypoint] No se encontró dist/main.js ni dist/src/main.js. Aborto."
  ls -lah dist || true
  exit 1
fi

echo "[entrypoint] Iniciando API -> $APP_MAIN"
exec node "$APP_MAIN"
