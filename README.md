<p align="center">
  <a href="http://nestjs.com/" target="blank">
    <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" />
  </a>
</p>

# 🚀 DRH-CHED API — Deploy Docker (Producción LAN)

API desarrollada en **NestJS + Prisma + PostgreSQL**, lista para ejecutarse en **entornos de red local (LAN)** mediante **Docker Compose**.

---

## 📦 Requisitos Previos

### 🧰 En tu servidor Ubuntu (Producción LAN)
Asegúrate de tener instalado:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl wget unzip
🐋 Instalar Docker y Docker Compose
bash
Copiar código
sudo apt install -y ca-certificates curl gnupg lsb-release

# Repositorio Docker oficial
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
Verifica instalación:

bash
Copiar código
docker --version
docker compose version
👤 Crear usuario deploy y configurar permisos SSH
Crear usuario:
bash
Copiar código
sudo adduser deploy
Darle permisos para Docker:
bash
Copiar código
sudo usermod -aG docker deploy
Permitir acceso SSH:
bash
Copiar código
sudo mkdir -p /home/deploy/.ssh
sudo chmod 700 /home/deploy/.ssh
sudo chown deploy:deploy /home/deploy/.ssh
🔐 Acceso SSH desde tu PC
💡 Nota:
Si ya puedes conectarte con:

bash
Copiar código
ssh deploy@192.168.200.212
usando contraseña, no es obligatorio configurar claves públicas.
Puedes mantener el acceso por contraseña si prefieres más control manual.

La copia de claves (ssh-copy-id) solo es necesaria si deseas acceso sin contraseña
(por ejemplo, para automatizar despliegues o CI/CD).

🪟 (Opcional) Si usas Windows y quieres habilitar acceso sin contraseña
powershell
Copiar código
# Generar clave pública
ssh-keygen -t ed25519

# Copiarla al servidor (versión equivalente a ssh-copy-id)
type $env:USERPROFILE\.ssh\id_ed25519.pub | ssh root@192.168.200.212 "mkdir -p /home/deploy/.ssh && cat >> /home/deploy/.ssh/authorized_keys && chown -R deploy:deploy /home/deploy/.ssh && chmod 700 /home/deploy/.ssh && chmod 600 /home/deploy/.ssh/authorized_keys"
Probar:

powershell
Copiar código
ssh deploy@192.168.200.212
🔐 Configuración de GitHub (acceso al repositorio)
1️⃣ Crear token personal en GitHub
En tu cuenta:

Settings → Developer Settings → Personal Access Tokens → Tokens (classic)

Crea un token con permisos:

repo

read:packages

workflow

2️⃣ Configurar credenciales en el servidor
bash
Copiar código
git config --global user.name "deploy"
git config --global user.email "deploy@local"
git config --global credential.helper store
Luego clona el repositorio (con tu token):

bash
Copiar código
git clone https://<TOKEN>@github.com/TU_USUARIO/TU_REPOSITORIO.git
💡 Ejemplo real:

bash
Copiar código
git clone https://<AQUIELTOKEN>@github.com/drhazul/drhched.git
🧱 Estructura de proyecto en servidor
bash
Copiar código
/home/deploy/drhched/
│
├── docker-compose.yml
├── .env
└── prisma/
    └── schema.prisma
⚙️ Variables de entorno (.env de producción)
Ejemplo completo:

env
Copiar código
# ===================================
# 🌐 Configuración general
# ===================================
NODE_ENV=production
PORT=3000

# ===================================
# 🔑 Autenticación JWT
# ===================================
JWT_SECRET="supersecretkey_drhched_prod"
JWT_EXPIRES_IN="7d"

# ===================================
# 🗄️ Base de datos (Docker)
# ===================================
DATABASE_URL="postgresql://postgres:postgres@postgres:5432/drhched_prod?schema=public"
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=drhched_prod

# ===================================
# 🧭 API Config
# ===================================
API_BASE_URL="http://192.168.200.212:3000/api"
CORS_ORIGIN="*"

# ===================================
# ⚙️ Prisma Config
# ===================================
PRISMA_LOG_LEVEL=info
Guarda este archivo en:

swift
Copiar código
/home/deploy/drhched/.env
🐳 Docker Compose — API + PostgreSQL
Ejemplo de docker-compose.yml:

yaml
Copiar código
version: "3.8"
services:
  postgres:
    image: postgres:15
    container_name: drhched_postgres
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: drhched_prod
    volumes:
      - ./postgres_data:/var/lib/postgresql/data
    networks:
      - drhched_net
    ports:
      - "5432:5432"

  api:
    build: .
    container_name: drhched_api
    restart: always
    depends_on:
      - postgres
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/drhched_prod?schema=public
      - PORT=3000
      - JWT_SECRET=supersecretkey_drhched_prod
      - NODE_ENV=production
    ports:
      - "3000:3000"
    networks:
      - drhched_net

networks:
  drhched_net:
    driver: bridge
🔄 Despliegue y migración de base de datos
Desde la carpeta del proyecto:

bash
Copiar código
cd /home/deploy/drhched
docker compose up -d --build
Una vez los contenedores estén arriba, ejecuta la migración:

bash
Copiar código
docker exec -it drhched_api npx prisma migrate deploy
Verifica logs:

bash
Copiar código
docker compose logs -f
🌐 Prueba desde la LAN
Desde otra PC de la red:

bash
Copiar código
curl http://192.168.200.212:3000/api
O en navegador:

arduino
Copiar código
http://192.168.200.212:3000/api
🧰 Mantenimiento rápido
Actualizar proyecto desde GitHub:

bash
Copiar código
cd /home/deploy/drhched
git pull
docker compose up -d --build
Reiniciar contenedores:

bash
Copiar código
docker compose restart
Limpiar caché / reconstruir completamente:

bash
Copiar código
docker compose down -v
docker compose up -d --build
Ver logs:

bash
Copiar código
docker compose logs -f
📚 Notas finales
El usuario deploy se utiliza exclusivamente para despliegue y mantenimiento remoto.

Puedes mantener autenticación por contraseña si prefieres más seguridad manual.

El token GitHub se recomienda rotarlo cada 3–6 meses.

Usa sudo journalctl -u ssh si tienes problemas con conexión SSH.

Asegúrate de exponer el puerto 3000 en tu red LAN para acceso desde Flutter Web.

📖 Documentación relacionada
🧩 Guía de desarrollo local (README.dev.md)

🐳 Infraestructura Docker (carpeta infra)

🧱 Base de datos / Prisma (carpeta db)

🔄 Flujo de trabajo — Desarrollo → Producción LAN
text
Copiar código
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
│ Servidor Ubuntu (svrflutter) │
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