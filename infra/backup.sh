#!/usr/bin/env bash
set -e
STAMP=$(date +%Y%m%d_%H%M%S)
OUT="/opt/drhched/backups/drhched_${STAMP}.sql.gz"
docker exec drhched_postgres pg_dump -U ${POSTGRES_USER:-drh_admin} ${POSTGRES_DB:-drhched} \
| gzip > "$OUT"
echo "Backup: $OUT"
