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

docker --version
docker compose version
👤 Crear usuario deploy y configurar permisos SSH
Crear usuario:

bash

sudo adduser deploy
Darle permisos para Docker:

bash

sudo usermod -aG docker deploy
Permitir acceso SSH:

bash

sudo mkdir -p /home/deploy/.ssh
sudo chmod 700 /home/deploy/.ssh
sudo chown deploy:deploy /home/deploy/.ssh
Desde tu PC local, copia tu clave pública:

bash

ssh-copy-id deploy@192.168.200.212
Verifica acceso:

bash

ssh deploy@192.168.200.212
🔐 Configuración de GitHub (acceso al repositorio)
1. Crear token personal en GitHub
En tu cuenta →
Settings > Developer Settings > Personal Access Tokens > Tokens (classic)
Crear un token con permisos:

repo

read:packages

workflow

2. Guardar el token en el servidor
En el servidor, configura Git globalmente para usar el token:

bash

git config --global user.name "deploy"
git config --global user.email "deploy@local"
git config --global credential.helper store
Luego clona usando el token:

bash

git clone https://<TOKEN>@github.com/TU_USUARIO/TU_REPOSITORIO.git
💡 Ejemplo:

bash

git clone https://ghp_a1b2c3d4e5f6g7h8i9j0@github.com/ioe-labs/drhched_api.git
🧱 Estructura de proyecto en servidor
bash

/home/deploy/drhched_api/
│
├── docker-compose.yml
├── .env
└── prisma/
    └── schema.prisma
⚙️ Variables de entorno (.env de producción)
Ejemplo básico:

env

DATABASE_URL="postgresql://postgres:postgres@postgres:5432/drhched_prod?schema=public"
PORT=3000
JWT_SECRET=supersecretkey
🐳 Docker Compose — API + PostgreSQL
Ejemplo de docker-compose.yml:

yaml

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
      - JWT_SECRET=supersecretkey
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

docker compose up -d --build
Una vez los contenedores estén arriba, ejecuta la migración:

bash

docker exec -it drhched_api npx prisma migrate deploy
Verifica logs:

bash

docker compose logs -f
🌐 Prueba desde la LAN
Desde otra PC de la red:

bash

curl http://192.168.200.212:3000/api
O abre en navegador:

arduino

http://192.168.200.212:3000/api
🧰 Mantenimiento rápido
Actualizar proyecto desde GitHub:

bash

cd /home/deploy/drhched_api
git pull
docker compose up -d --build
Reiniciar contenedores:

bash

docker compose restart
Limpiar caché / reconstruir completamente:

bash

docker compose down -v
docker compose up -d --build
📚 Notas finales
El usuario deploy se utiliza exclusivamente para despliegue y mantenimiento remoto.

Las claves SSH permiten acceso sin contraseña.

El token GitHub se recomienda rotarlo cada 3–6 meses.

Usa sudo journalctl -u ssh si tienes problemas con conexión SSH.

Recuerda exponer el puerto 3000 en tu red LAN para acceso desde Flutter Web.

© 2025 — DRH-CHED Project
Desarrollado con ❤️ sobre NestJS, Prisma y PostgreSQL



