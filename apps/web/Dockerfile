FROM oven/bun:alpine AS base

WORKDIR /app

FROM base AS prepare
RUN bun i -g turbo
COPY . .
RUN turbo prune web --docker

FROM base AS builder
COPY --from=prepare /app/out/json/ .
RUN bun install
COPY --from=prepare /app/out/full/ .
RUN bun turbo build

FROM caddy:alpine AS runner

COPY Caddyfile /etc/caddy/Caddyfile

EXPOSE 3001

COPY --from=builder /app/apps/web/dist /srv
