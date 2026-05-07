# Session Handoff

## Verificado ahora

- Qué está funcionando actualmente: signup y login con email+password end-to-end. Cookie de sesión persiste entre reloads y entre pestañas (mismo cookie jar).
- Qué verification corrió realmente:
  - `bun check-types` (3/3 packages OK).
  - `bun db:start && bun db:push` (4 tablas Better-Auth creadas).
  - Curl directo a `/api/auth/sign-up/email`, `/api/auth/get-session`, `/api/auth/sign-in/email`.
  - Browser via Chrome DevTools MCP: /register → /, reload → persiste, pestaña aislada → /login con bad creds (toast genérico) y con creds correctas (sesión).

## Cambios de esta session

- Código o comportamiento agregado:
  - `packages/auth/src/index.ts`: cookie attrs condicionadas por `NODE_ENV` para que el login funcione en dev cross-port (3000↔3001) sobre HTTP plain.
  - `apps/web/src/features/auth/schemas/register.ts`: schema reducido a `{ email, password, confirmPassword }` (ADR-0007).
  - `apps/web/src/features/auth/components/register-form.tsx`: removidos campos `username` y `birthdate`; `onSubmit` llama a `authClient.signUp.email({ email, password, name: email })` y navega a `/`.
  - `apps/web/src/features/auth/components/login-form.tsx`: `onSubmit` llama a `authClient.signIn.email`; en error muestra toast "Credenciales inválidas" (AUTH.md).
  - `apps/web/src/routes/index.tsx` nuevo: landing autenticado-aware con `authClient.useSession()`. Stub mínimo, NO es la protección de rutas formal.
- Cambios en infrastructure o harness:
  - `apps/web/src/routeTree.gen.ts` regenerado por el plugin de TanStack para incluir la ruta `/`.
  - Postgres 17 corriendo en Docker (container `meteor-postgres`, puerto 5432). 4 tablas Better-Auth creadas vía `db:push`.

## Roto o sin verificar

- Defecto conocido: ninguno detectado en la slice del feature.
- Path sin verificar:
  - Email verification real (no hay Mailer/Resend/Mailpit aún). Better-Auth marca `email_verified=false` y AUTH.md lo permite hasta que el user intente crear/joinear server.
  - Rate limiting + CAPTCHA Turnstile (SECURITY.md). Deuda explícita, no implementado en este slice.
  - Logout y protección formal de rutas (feature priority 4).
- Riesgo para la siguiente session: la cookie de dev usa SameSite=Lax. Si se prueba en un host distinto a localhost o con un browser muy estricto puede no setearse — el plan B documentado es un Vite proxy en `apps/web/vite.config.ts` para `/api/auth/*`.

## Mejor siguiente paso

- Feature sin terminar de mayor prioridad: `auth-oauth-google` (priority 2).
- Por qué va siguiente: continúa la lógica de orden por prioridad de `feature_list.json`. Reusa el scaffold de Better-Auth ya wireado y deja el sistema con dos métodos de auth disponibles antes de tocar onboarding (`/welcome`, priority 5) y servers.
- Qué cuenta como passing:
  - Plugin OAuth de Better-Auth configurado con credenciales de Google Cloud Console.
  - Botón "Continuar con Google" en `/login` y `/register` que redirige al consent screen.
  - Tras el callback, user creado en DB con `account.provider_id="google"`, sesión activa.
  - User puede volver a iniciar sesión con Google después de "logout" (cookie limpia).
- Qué no debe cambiar durante ese paso: el flujo email+password ya wireado, el schema de DB (no agregar `username` aún — eso es priority 5), la ruta `/` stub.

## Commands

- Startup: `bun db:start && bun db:push && bun dev`
- Verification: `bun check-types`; flujo manual en `http://localhost:3001/register` y `http://localhost:3001/login`.
- Debug command focalizado:
  - `docker exec meteor-postgres psql -U postgres -d meteor -c "SELECT email, email_verified FROM \"user\";"` para inspeccionar usuarios.
  - `bun db:studio` abre Drizzle Studio.
