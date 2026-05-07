# ADR 0003 — Identificadores: `text` con cuid2 en todas las tablas

**Status:** accepted

Todas las tablas del schema usan `id` de tipo `text` con valores generados como cuid2 en código de aplicación. Esto incluye tanto las tablas de Better-Auth (que ya lo hacían por convención) como todas las tablas de dominio (`server`, `channel`, `message`, `member`, `role`, etc.). Drizzle declara la columna como `text("id").primaryKey().$defaultFn(() => createId())` con `createId` importado de `@paralleldrive/cuid2`.

## Considered Options

- **UUID nativo de Postgres (`uuid` + `gen_random_uuid()`).** Tooling más amplio (clientes SQL los muestran prolijos) y los genera la base de datos. **Rechazado** porque obligaría a migrar las tablas de Better-Auth de `text` a `uuid` (con riesgo de pelearse con plugins como `username`), y porque mezclar `uuid` y `text` en foreign keys hacia `user.id` es imposible — habría que elegir igual.

## Consequences

- Cualquier `clientNonce`, `messageId`, `channelId` que viaje en el protocolo WS o en la API REST es un cuid2 (string de 24 chars `[a-z0-9]`). Los Zod schemas usan `z.string().refine(isCuid)` en lugar de `z.string().uuid()`. El documento `research/decisiones-mvp.md` originalmente sugería `.uuid()` — eso se sobrescribe con esta decisión.
- Los IDs son URL-safe sin escape, más cortos que UUID v4 (24 vs 36 chars), y lexicográficamente ordenables — ventaja menor pero útil.
- Postgres no genera los IDs; los genera el código de la app antes del INSERT. Operacionalmente, esto significa que un `INSERT` desde `psql` directo requiere generar el cuid2 manualmente o usar un default a nivel de aplicación.
- Si en el futuro alguna tabla específica necesita IDs ordenados por tiempo (e.g., para optimizar índices en una tabla de eventos enorme), se evalúa cuid2 vs ULID/UUID v7 ahí puntualmente — no se mezcla con el resto del schema.
