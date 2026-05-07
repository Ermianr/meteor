# AUTH

Identidad, autenticación y sesiones.

---

## Métodos disponibles

- Email + password.
- OAuth Google.
- OAuth GitHub.

**Magic link y passkeys → Anillo 2.**

---

## Identidad

- **Username único global.** Charset `[a-z0-9_]`, 3-20 caracteres, lowercase. Editable con cooldown de 30 días.
- **Display name** libre. Unicode permitido, 1-32 caracteres. Default = username.

---

## Sesiones

- Better-Auth con cookies HTTP-only.
- Sesiones Postgres-backed.
- Multi-device.
- Sliding expiration 30 días.
- WebSocket valida sesión en el handshake.

---

## Verificación de email

Email obligatorio verificado **antes** de poder crear o joinear servers. Anti-bot.

---

## Mensajes de error

Auth nunca enumera emails. Para cualquier fallo de credenciales el mensaje es genérico (`credenciales inválidas`).
