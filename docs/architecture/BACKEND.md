# BACKEND

Arquitectura del server: Bun + Hono.

App vive en `apps/server/`.

---

## Estructura interna

```
apps/server/src/
├── routes/        # endpoints HTTP + ws.ts
├── lib/           # PubSub, Storage, Mailer, Search, RateLimiter
├── services/      # lógica de negocio
├── ws/            # handlers, presence, ConnectionManager
└── index.ts
```

---

## Capas

- **`routes/`** — capa de transporte. Hono handlers HTTP y entrypoint del WebSocket. No contiene lógica de negocio.
- **`services/`** — lógica de negocio pura. Una función / módulo por operación de dominio (ej: `messages.send`, `servers.create`). Reciben dependencias inyectadas (DB, PubSub, Storage…).
- **`ws/`** — handlers de eventos del WebSocket, presencia en memoria, `ConnectionManager`.
- **`lib/`** — implementaciones de las abstracciones del proyecto (`PubSub`, `Storage`, `Mailer`, `SearchProvider`, `RateLimiter`). Ver [ABSTRACTIONS.md](./ABSTRACTIONS.md).

---

## Errores

Clase `AppError` con campos:

- `code` — semántico, estable, parte del contrato.
- `message` — humano.
- `statusCode` — HTTP.
- `context` — datos relevantes para debug / logs.
- `cause` — error original.

Middleware Hono captura `AppError`, logea con evlog, y devuelve `{ error: { code, message } }`.

---

## Validación de entorno

Los secretos y la configuración se validan al arrancar el server con un Zod schema en `packages/config`. **Fail-on-boot** si falta secret crítico.

---

## Premature modularization — qué NO hacer

**No** se crean `packages/realtime`, `packages/messaging`, etc. Toda la lógica del server vive en `apps/server`. Solo se extrae a un package cuando hay un consumidor real (cliente, otro app, otro deployable).
