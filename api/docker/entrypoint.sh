#!/usr/bin/env sh
set -e


# Espera opcional por DB (simple): reintenta hasta que abra el puerto
if [ -n "$DATABASE_URL" ]; then
echo "[entrypoint] Esperando a la base de datos..."
# Extrae host y puerto (formato postgres://user:pass@host:port/db)
DB_HOST=$(echo "$DATABASE_URL" | sed -E 's#.+@([^:/]+).+#\1#')
DB_PORT=$(echo "$DATABASE_URL" | sed -E 's#.+:([0-9]+)/.+#\1#')
: "${DB_PORT:=5432}"
for i in $(seq 1 30); do
(echo > /dev/tcp/$DB_HOST/$DB_PORT) >/dev/null 2>&1 && break
echo " intento $i/30: $DB_HOST:$DB_PORT aún no responde..."; sleep 2
done
fi


# Ejecuta migraciones en producción (idempotente)
if [ -x ./node_modules/.bin/prisma ]; then
echo "[entrypoint] Ejecutando prisma migrate deploy..."
./node_modules/.bin/prisma migrate deploy || true
echo "[entrypoint] prisma generate (por si hay cambios en runtime)..."
./node_modules/.bin/prisma generate || true
fi


# Inicia la app Nest compilada
exec node dist/main.js