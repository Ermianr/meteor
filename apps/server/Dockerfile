FROM oven/bun:alpine as base

RUN apk update

WORKDIR /app

FROM base AS prepare
RUN bun i -g turbo
COPY . .
RUN turbo prune server --docker

FROM base as builder
COPY --from=prepare /app/out/json/ .
RUN bun install
COPY --from=prepare /app/out/full/ .
RUN bun turbo compile

FROM base AS runner
USER bun

COPY --from=builder /app/apps/server ./

EXPOSE 3000

CMD ./server