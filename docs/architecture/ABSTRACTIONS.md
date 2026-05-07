# ABSTRACTIONS

Patrón consistente para todas las dependencias externas del proyecto.

---

## Patrón

Todas las abstracciones siguen la misma estructura:

1. Una **interfaz** en `apps/server/src/lib/<nombre>/<nombre>.ts`.
2. **Dos implementaciones**: una para dev / Anillo 1 y otra para prod / escala.
3. **Switch por env var**, sin magia ni feature flags.
4. **Ruta de escalado clara** sin reescribir el código de aplicación.

---

## Catálogo

| Abstracción | Dev | Prod / Escala |
| --- | --- | --- |
| `PubSub` | `InMemoryPubSub` | `PostgresPubSub` (vía `LISTEN`/`NOTIFY`) |
| `Storage` | `LocalStorage` (FS) o `S3CompatibleStorage` (MinIO) | `S3CompatibleStorage` (R2) |
| `Mailer` | `SmtpMailer` (Mailpit) | `ResendMailer` |
| `SearchProvider` | `PostgresSearchProvider` | `PostgresSearchProvider` (luego `MeiliSearchProvider`) |
| `RateLimiter` | `InMemoryRateLimiter` | `InMemoryRateLimiter` (luego `RedisRateLimiter`) |

---

## Por qué

- **Cero infra extra en Anillo 1.** Postgres + filesystem cubren todo.
- **Prod-ready desde el inicio** para Storage y Mailer (R2 + Resend).
- **Ruta clara hacia multi-instancia** sin reescribir: `PubSub` y `RateLimiter` ya tienen su variante escalable lista, solo se cambia un env var.

Ver también:

- `PubSub` — [REALTIME.md](./REALTIME.md).
- `Storage`, `Mailer` — [STORAGE.md](./STORAGE.md).
- `SearchProvider` — [SEARCH.md](./SEARCH.md).
- `RateLimiter` — [SECURITY.md](./SECURITY.md).
