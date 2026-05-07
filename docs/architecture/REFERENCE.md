# Architecture — Meteor

Decisiones de arquitectura de Meteor (Anillo 1).

---

## Índice

### Visión y alcance

- [OVERVIEW](./OVERVIEW.md) — diferenciador, alcance, anillos diferidos.

### Aplicación

- [FRONTEND](./FRONTEND.md) — TanStack Start, rutas, estado, WebSocket cliente.
- [BACKEND](./BACKEND.md) — Hono, capas, errores.
- [REALTIME](./REALTIME.md) — WebSocket, contrato de mensajes, presencia, typing.

### Datos

- [DATA-MODEL](./DATA-MODEL.md) — schema completo (servers, canales, DMs, mensajes, permisos).
- [AUTH](./AUTH.md) — autenticación, sesiones, identidad.
- [STORAGE](./STORAGE.md) — uploads (R2 / MinIO) y email (Resend / Mailpit).
- [SEARCH](./SEARCH.md) — Postgres FTS, operadores.

### Calidad y operación

- [PERFORMANCE](./PERFORMANCE.md) — performance budget como gate de release.
- [SECURITY](./SECURITY.md) — anti-abuso y rate limiting.
- [OBSERVABILITY](./OBSERVABILITY.md) — `evlog`, eventos, drains.
- [TESTING](./TESTING.md) — Testing Trophy, E2E críticos.
- [DEPLOYMENT](./DEPLOYMENT.md) — Dokploy, CI/CD, migraciones.

### Estructura

- [MONOREPO](./MONOREPO.md) — layout del repo.
- [ABSTRACTIONS](./ABSTRACTIONS.md) — patrón de interfaz + 2 implementaciones.
