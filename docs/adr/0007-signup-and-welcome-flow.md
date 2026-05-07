# ADR 0007 — Flujo de signup y onboarding obligatorio en `/welcome`

**Status:** accepted

El **User** se crea inicialmente con `username = NULL` (tanto por signup email/password como por OAuth). Tras la creación de la sesión, un middleware redirige cualquier ruta autenticada a `/welcome` mientras `user.username IS NULL`. En `/welcome` el User completa su `username` y opcionalmente su `displayName`. El campo `name` heredado del core de Better-Auth se trata como **artefacto write-only**: se persiste para satisfacer el requirement del library, pero nunca se lee ni se expone en la UI ni en la API de Meteor. Toda lectura visible al usuario usa `displayName ?? username`.

## Flujo concreto

**Signup email/password:**
1. Form `/signup` pide **solo email + password** (no se pide "name"; a Better-Auth se le pasa `name: email` como placeholder).
2. Better-Auth crea el `user` con `username = NULL`, envía email de verificación.
3. Click en link de verificación → `/verify` confirma email → auto-login.
4. Middleware: si `username IS NULL` → redirect a `/welcome`.

**Signup OAuth (Google/GitHub):**
1. Provider devuelve email + nombre + avatar. Email viene ya verificado.
2. Better-Auth crea el `user` (`name` recibe el nombre del provider — guardado pero ignorado en UI; `image` recibe el avatar).
3. Auto-login.
4. Middleware: si `username IS NULL` → redirect a `/welcome`.

**`/welcome`:**
- Campo `username`: pre-rellenado con `localPart(email).replace(/[^a-z0-9_]/g, '')` lowercase. Validación en vivo de disponibilidad.
- Campo `displayName`: vacío por default (`NULL`). Placeholder "Opcional — si lo dejás vacío, se mostrará tu username".
- Submit: `user.username = X`, `user.displayName = Y || NULL`, `user.usernameUpdatedAt = NOW()`. Redirect a `/channels/@me`.

**Bloqueo en `/welcome`:**
- Si email no verificado (flujo email/password), botón "Continuar" disabled hasta verificación.
- Si usuario cierra la pestaña, vuelve a `/welcome` al próximo login. La sesión existe pero todas las rutas autenticadas redirigen aquí.
- Cleanup periódico: users con `username IS NULL` y `createdAt < NOW() - 7 días` se borran como abandoned signups.

## Considered Options

- **Username en el form de signup inicial.** Rechazado: rompe la uniformidad con OAuth (Google/GitHub no proveen username), obligaría a tener dos flows distintos.
- **Pre-llenar `displayName` con `user.name`** (heredado de Better-Auth o del provider OAuth). Rechazado por decisión explícita del usuario: no queremos que `name` aparezca en UI, ni siquiera como pre-fill. `displayName` arranca NULL.
- **Username sugerido auto-generado con sufijo aleatorio si está taken.** Rechazado para MVP por producir usernames poco memorables (`juan_4f2`); el user elige siempre.
- **Permitir uso de la app con `username NULL` durante un grace period.** Rechazado: complica el modelo (muchas features dependen de username) sin valor real.

## Consequences

- Middleware de Hono/server: cualquier endpoint autenticado verifica `if (user.username == null) return 403 / redirect '/welcome'`. Excepción: el endpoint que setea el username (`POST /api/me/username`) y los logout/verify endpoints.
- Middleware del frontend (TanStack Router): `beforeLoad` en `_app.tsx` hace el redirect si `user.username == null`. La ruta `/welcome` está fuera del `_app.tsx` para que sea accesible.
- El campo `user.name` en el schema **se mantiene** (es de Better-Auth, removerlo es buscarse problemas). Política de uso: nunca leer desde código de aplicación, nunca exponer en API, nunca mostrar en UI. Cualquier serializer JSON omite el campo. Comentario en el schema lo deja explícito.
- El form de signup email/password no tiene campo "name". El service de signup mapea `name` internamente al email para satisfacer Better-Auth.
- El cleanup de abandoned signups es un job programado, escrito en `services/cleanup.ts` (mismo file que la purga de soft deletes del ADR 0005).
