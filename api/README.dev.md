<p align="center">
  <a href="http://nestjs.com/" target="blank">
    <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" />
  </a>
</p>

# 🧩 DRH-CHED API — Entorno de Desarrollo Local

Este documento describe cómo preparar y ejecutar el proyecto **DRH-CHED API (NestJS + Prisma + PostgreSQL)** en tu **PC local** (sin Docker).

---

## 📦 Requisitos Previos

### 🧰 En tu máquina local (Desarrollo)

Instalar las siguientes herramientas:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl wget unzip
⚙️ Node.js y npm
Instala la versión LTS más reciente (recomendado Node 20+):

bash

sudo apt install -y nodejs npm
node -v
npm -v
O usando nvm (recomendado):

bash

curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh | bash
source ~/.bashrc
nvm install --lts
🧰 Instalar NestJS CLI y Prisma
bash

npm install -g @nestjs/cli
npm install -g prisma
Verifica:

bash

nest --version
prisma --version
🧬 Clonar el repositorio desde GitHub
Si ya tienes tu token configurado:

bash

git clone https://<TOKEN>@github.com/TU_USUARIO/TU_REPOSITORIO.git
cd TU_REPOSITORIO
Si no, puedes usar tu conexión SSH:

bash

git clone git@github.com:TU_USUARIO/TU_REPOSITORIO.git
⚙️ Variables de entorno (.env local)
Crea un archivo .env en la raíz del proyecto:

env

DATABASE_URL="postgresql://postgres:postgres@localhost:5432/drhched_dev?schema=public"
PORT=3000
JWT_SECRET=devsecretkey
⚠️ Asegúrate de tener PostgreSQL ejecutándose localmente.

🐘 Base de datos local
Si no tienes PostgreSQL instalado, puedes hacerlo así:

bash

sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable postgresql
sudo systemctl start postgresql
Crear base de datos y usuario:

bash

sudo -u postgres psql
CREATE USER postgres WITH PASSWORD 'postgres';
CREATE DATABASE drhched_dev OWNER postgres;
\q
Verificar conexión:

bash

psql -h localhost -U postgres -d drhched_dev
📁 Instalar dependencias del proyecto
Desde la carpeta raíz:

bash

npm install
🧱 Ejecutar migraciones Prisma
bash

npx prisma migrate dev
Esto generará el esquema inicial y creará la base de datos con las tablas.

🚀 Iniciar el servidor de desarrollo
bash

npm run start:dev
El API se ejecutará en:

bash

http://localhost:3000/api
🧭 Rutas base
Healthcheck:
GET /api/health

Auth / Users (según módulo):
POST /api/auth/login
GET /api/users

🧰 Comandos útiles
Acción	Comando
Actualizar dependencias	npm update
Ver estructura Prisma	npx prisma studio
Ejecutar formato	npm run format
Lint (estilo de código)	npm run lint

🔄 Sincronización con producción
Cuando termines de hacer cambios locales:

bash

git add .
git commit -m "fix: ajustes locales"
git push origin main
Luego, en el servidor (usuario deploy):

bash

cd /home/deploy/drhched_api
git pull
docker compose up -d --build
💡 Tips
Si necesitas apuntar tu entorno local a la base de datos del servidor LAN, cambia en .env:

env

DATABASE_URL="postgresql://postgres:postgres@192.168.200.212:5432/drhched_prod?schema=public"
Usa npm run build para compilar antes de un deploy manual.

Prisma Studio (npx prisma studio) te permite ver y editar datos visualmente.

📚 Resumen
Entorno	Puerto	DB	Ejecución
Local Dev	3000	drhched_dev	npm run start:dev
Producción LAN	3000	drhched_prod	docker compose up -d --build


---

## 🔄 Flujo de trabajo — Desarrollo → Producción LAN

```text
┌────────────────────────────┐
│        💻 DESARROLLO        │
│────────────────────────────│
│ Tu PC local (Ubuntu/Win)   │
│                            │
│ • Node.js + NestJS CLI     │
│ • Prisma conectado a DB    │
│ • Ejecución:               │
│   npm run start:dev        │
│                            │
│ 👉 Haces commits y push a  │
│    GitHub (rama main/dev)  │
└──────────────┬─────────────┘
               │  (git push)
               ▼
┌────────────────────────────┐
│    🌐 REPOSITORIO GITHUB    │
│────────────────────────────│
│ Guarda código actualizado  │
│ Permite clonación o pull   │
│ vía token o SSH            │
└──────────────┬─────────────┘
               │  (git pull)
               ▼
┌────────────────────────────┐
│      🖥️ PRODUCCIÓN LAN      │
│────────────────────────────│
│ Servidor Ubuntu 25.04      │
│ Usuario: deploy            │
│                            │
│ • Docker + Compose         │
│ • Servicios:               │
│   - PostgreSQL (db)        │
│   - NestJS API (api)       │
│                            │
│ • Ejecución:               │
│   docker compose up -d     │
│                            │
│ API expuesta en LAN:       │
│   http://192.168.200.212:3000/api
└──────────────┬─────────────┘
               │
               ▼
┌────────────────────────────┐
│        📱 CLIENTES          │
│────────────────────────────│
│ Flutter Web / App Móvil    │
│                            │
│ Se conectan a la API vía   │
│ LAN usando:                │
│   API_BASE_URL=            │
│   http://192.168.200.212:3000/api
└────────────────────────────┘


© 2025 — DRH-CHED Project
Desarrollado con ❤️ sobre NestJS, Prisma y PostgreSQL