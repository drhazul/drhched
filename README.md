<p align="center">
  <a href="http://nestjs.com/" target="blank">
    <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" />
  </a>
</p>

# 🚀 DRH-CHED API — Deploy Docker (Producción LAN)

API desarrollada en **NestJS + Prisma + PostgreSQL**, lista para ejecutarse en **LAN** con **Docker Compose**.  
**Ubicación real del stack:** `/home/deploy/drhched/drhched-api/`

---

## 📦 Requisitos Previos (Servidor Ubuntu)

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl wget unzip ca-certificates gnupg lsb-release
🐋 Docker & Compose
bash
Copiar codigo:
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
 | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
 https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
 | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

docker --version
docker compose version
👤 Usuario deploy (opcional pero recomendado)
bash
Copiar codigo:
sudo adduser deploy
sudo usermod -aG docker deploy
sudo mkdir -p /home/deploy/.ssh
sudo chmod 700 /home/deploy/.ssh
sudo chown deploy:deploy /home/deploy/.ssh
💡 Puedes usar contraseña en SSH sin claves públicas.
Si prefieres acceso sin contraseña (CI/CD): genera llave y copia la id_ed25519.pub a authorized_keys.

🔐 Clonar el repositorio (sin exponer tokens)
bash
Copiar codigo:
# HTTPS (usa placeholder, NO pegues PAT reales en documentos)
git clone https://github.com/drhazul/drhched.git

# o SSH (recomendado si configuraste llaves)
# git clone git@github.com:drhazul/drhched.git
Estructura relevante:

arduino
Copiar codigo:
/home/deploy/drhched/
├── api/
├── db/
├── infra/
└── drhched-api/            ← aquí vive el stack de producción
    ├── docker-compose.yml
    ├── Dockerfile
    ├── docker/
    │   └── entrypoint.sh
    ├── prisma/
    │   ├── schema.prisma
    │   └── migrations/
    └── (src, package.json, etc.)
⚙️ Variables de entorno (archivo .env.prod)
📍 Crear en: /home/deploy/drhched/drhched-api/.env.prod

env
Copiar codigo:
# ---------- APP ----------
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# CORS
CORS_ORIGIN=*
CORS_ORIGINS=http://localhost:5173

# ---------- JWT / AUTH ----------
JWT_ACCESS_SECRET=Cafecitoconpan.2025
JWT_REFRESH_SECRET=Fitsdiario.2025
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
# Fallbacks comunes
JWT_SECRET=Cafecitoconpan.2025
JWT_EXPIRES_IN=7d

# ---------- DB ----------
POSTGRES_USER=drhched
POSTGRES_PASSWORD=Siempreseguro.2025
POSTGRES_DB=drhched
DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}?schema=public&connection_limit=5

# ---------- Prisma ----------
PRISMA_LOG_LEVEL=error

# ---------- Nest (opcional) ----------
GLOBAL_PREFIX=api
HEALTH_ENDPOINT=/health

# ---------- pgAdmin ----------
PGADMIN_DEFAULT_EMAIL=admin@local
PGADMIN_DEFAULT_PASSWORD=ChangeMe123!
❗ No subas .env.prod al repo. Deja en el repo un .env.example sin secretos.

🐳 Docker Compose (API + Postgres + pgAdmin)
Ya incluido y corregido en drhched-api/docker-compose.yml.
Usa puertos portables 0.0.0.0 y lee desde .env.prod.

yaml
Copiar codigo:
version: "3.8"

services:
  db:
    image: postgres:16-alpine
    container_name: drhched_db
    restart: unless-stopped
    env_file:
      - .env.prod
    ports:
      - "0.0.0.0:5432:5432"     # elimina esta línea si NO quieres exponer DB en LAN
    networks:
      - backend
    volumes:
      - postgres-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $$POSTGRES_USER -d $$POSTGRES_DB -h 127.0.0.1 -p 5432"]
      interval: 5s
      timeout: 3s
      retries: 20

  api:
    build:
      context: .
    container_name: drhched_api
    restart: unless-stopped
    env_file:
      - .env.prod
    depends_on:
      db:
        condition: service_healthy
    networks:
      - backend
    ports:
      - "0.0.0.0:3000:3000"
    volumes:
      - ./prisma:/app/prisma:ro

  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: drhched_pgadmin
    restart: unless-stopped
    env_file:
      - .env.prod
    depends_on:
      db:
        condition: service_healthy
    networks:
      - backend
    ports:
      - "0.0.0.0:5050:80"
    volumes:
      - pgadmin-data:/var/lib/pgadmin
      - ./docker/pgadmin/servers.json:/pgadmin4/servers.json:ro

networks:
  backend:
    driver: bridge

volumes:
  postgres-data:
  pgadmin-data:
📍 Crea drhched-api/docker/pgadmin/servers.json con:

json
Copiar codigo:
{
  "Servers": {
    "1": {
      "Name": "drhched-db",
      "Group": "Servers",
      "Port": 5432,
      "Username": "postgres",
      "Host": "db",
      "SSLMode": "prefer",
      "MaintenanceDB": "postgres"
    }
  }
}
▶️ Despliegue (automatizado con entrypoint)
Desde la carpeta del stack:

bash
Copiar codigo:
cd /home/deploy/drhched/drhched-api
docker compose up -d --build
El contenedor api hace automáticamente:

Esperar a la DB (db:5432)

prisma generate

prisma migrate deploy

Iniciar la API (node dist/main.js)

Verifica logs:

bash
Copiar codigo:
docker compose logs -f api
🌐 Acceso
API: http://<IP_DEL_SERVIDOR>:3000/api

pgAdmin: http://<IP_DEL_SERVIDOR>:5050
Usuario/clave: los de .env.prod
Conexión pre-registrada a host db.

🧰 Mantenimiento
Actualizar código y reconstruir:

bash
Copiar codigo:
cd /home/deploy/drhched
git pull

cd /home/deploy/drhched/drhched-api
docker compose up -d --build
Reiniciar servicios:

bash
Copiar codigo:
docker compose restart
Reconstruir desde cero:

bash
Copiar codigo:
docker compose down -v
docker compose up -d --build
Ver logs:

bash
Copiar codigo:
docker compose logs -f
🔒 Buenas prácticas
Nunca pegues PAT reales (ghp_...) en README o commits.

Usa .env.example y añade .env* al .gitignore.

Si usas email para login, por ahora único global (simplifica).

Exponer Postgres (5432) es opcional; quita ese ports si no es necesario.

📖 Documentación relacionada
Guía de desarrollo local: README.dev.md

Infraestructura Docker: infra/

Base de datos / Prisma: db/ y drhched-api/prisma/

© 2025 — DRH-CHED Project • NestJS + Prisma + PostgreSQL