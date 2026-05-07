# OBSERVABILITY

Logging, errores y métricas.

---

## Filosofía

**`evlog` con wide events.** Un evento por operación de negocio con todo el contexto adjunto. **No** hay `log.info` sueltos repartidos por la base.

---

## Eventos críticos

### Server

- `auth.login.*`, `auth.signup.*`
- `message.send`, `message.edit`, `message.delete`
- `channel.create`, `server.create`
- `member.join`, `member.leave`
- `invite.create`, `invite.use`
- `permission.denied`
- `rate_limit.hit`
- `ws.connect`, `ws.disconnect`, `ws.fanout`
- `error.unhandled`

### Cliente

- `web_vital`
- `error.unhandled`
- `ws.disconnect`

---

## Drains

- **Dev:** file drain (NDJSON en `.evlog/logs/`). Skill `analyze-logs` aplicable.
- **Prod:** Axiom.

---

## Sampling

- **Pre-launch (Anillo 1):** 100% en todo. Descubrimiento agresivo de bugs.
- **Post-launch:** baja a 1-10% solo para eventos de alto volumen.

---

## Enrichers automáticos

Se adjuntan a cada evento sin que el call-site los pase:

`timestamp`, `traceId`, `userId`, `sessionId`, `userAgent`, `clientPlatform`, `requestPath` / `wsEventType`, `appVersion`, `gitSha`, `environment`.

---

## Errores

Clase `AppError` con campos `code`, `message`, `statusCode`, `context`, `cause`.

Middleware Hono:

1. captura `AppError`,
2. logea con evlog,
3. devuelve `{ error: { code, message } }`.

Ver también [BACKEND.md](./BACKEND.md).
