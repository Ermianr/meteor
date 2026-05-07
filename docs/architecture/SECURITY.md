# SECURITY

Anti-abuso, rate limiting y endurecimiento básico.

---

## Estrategia

**Token bucket para todo.** Permite ráfagas legítimas y corta spam sostenido.

Abstracción `RateLimiter`:

- `InMemoryRateLimiter` — Anillo 1.
- `RedisRateLimiter` — listo para activar al escalar multi-instancia. **Único caso donde Redis es necesario.**

---

## Límites

| Acción | Límite |
| --- | --- |
| Mensajes (incluye edits) | 10/s, 100/min |
| Reacciones | 30/min |
| Subir archivos | 5/min |
| Crear servers | 5/h |
| Crear canales por server | 30/h |
| Crear invitaciones por server | 20/h |
| Login attempts | 5 fallos en 15min → lockout 15min |
| Signup por IP | 3/h |
| Forgot password | 3/h por email + 5/h por IP |

- **Per `userId`** para acciones autenticadas.
- **Per IP** para pre-auth.

---

## Defensas adicionales

- **CAPTCHA Cloudflare Turnstile** después de N fallos de auth, **activo desde el inicio**.
- **Email verificado obligatorio** para crear/joinear servers.
- **Spam de mensajes:** solo "no 5 idénticos consecutivos del mismo usuario".

**Diferido a Anillo 2:** reportes, bans, word filter.

---

## UX al chocar el límite

- **REST:** `429` con headers `X-RateLimit-*` + toast sutil.
- **WebSocket:** `{ type: 'error', code: 'rate_limited' }` + composer bloqueado brevemente, optimistic revertido.
- **Auth:** nunca enumerar emails. Mensaje genérico `credenciales inválidas`.
