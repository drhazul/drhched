# ----------------------------------------
# Base
# ----------------------------------------
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl bash \
  && addgroup -S appgroup \
  && adduser -S appuser -G appgroup
WORKDIR /app

# PNPM con Corepack
RUN corepack enable && corepack prepare pnpm@9 --activate

# ----------------------------------------
# Deps (SIN scripts para evitar prisma generate aquí)
# ----------------------------------------
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
# Clave: --no-frozen-lockfile (por lock desfasado) + --ignore-scripts
RUN pnpm install --no-frozen-lockfile --ignore-scripts

# ----------------------------------------
# Builder (ya con todo el código y prisma)
# ----------------------------------------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Agregamos un DATABASE_URL dummy SOLO para el build (para prisma generate)
ARG DUMMY_DATABASE_URL="postgresql://user:pass@localhost:5432/placeholder?schema=public"
ENV DATABASE_URL=${DUMMY_DATABASE_URL}

# Generar Prisma Client y compilar Nest
RUN npx prisma generate
RUN npm run build

# ----------------------------------------
# Runner (final)
# ----------------------------------------
FROM base AS runner
ENV NODE_ENV=production
ENV HOST=0.0.0.0
WORKDIR /app

# Copiar artefactos con propietario correcto
USER root
COPY --from=builder --chown=appuser:appgroup /app/package.json ./package.json
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /app/dist ./dist
COPY --from=builder --chown=appuser:appgroup /app/prisma ./prisma
COPY --from=builder --chown=appuser:appgroup /app/prisma.config.ts ./prisma.config.ts

# Copiar entrypoint y dar permisos
COPY --chown=appuser:appgroup docker/entrypoint.sh ./docker/entrypoint.sh
RUN chmod +x ./docker/entrypoint.sh \
  && chown -R appuser:appgroup /app

USER appuser
EXPOSE 3000
ENTRYPOINT ["bash", "docker/entrypoint.sh"]
