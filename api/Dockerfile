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
# 👇 clave: no-frozen-lockfile (por tu lock desfasado) + ignore-scripts
RUN pnpm install --no-frozen-lockfile --ignore-scripts

# ----------------------------------------
# Builder (ya con todo el código y prisma)
# ----------------------------------------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# genera Prisma Client aquí (ya existe prisma.config.ts / prisma/schema.prisma)
RUN pnpm prisma generate
RUN pnpm run build

# ----------------------------------------
# Runner (final)
# ----------------------------------------
FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY docker/entrypoint.sh docker/entrypoint.sh
USER appuser
EXPOSE 3000
ENTRYPOINT ["bash", "docker/entrypoint.sh"]
