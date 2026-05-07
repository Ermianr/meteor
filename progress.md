# Progress Log

## Estado actual verificado

- Root del repo: `<repo-root>/meteor`
- Path estándar de startup: `bun db:start && bun db:push && bun dev` (web :3001, server :3000, Postgres :5432 vía Docker).
- Path estándar de verificación: `bun check-types` + flujo manual signup/login en navegador (ver Session 001).
- Feature sin terminar de mayor prioridad actualmente: `auth-oauth-google` (priority 2).
- Blocker actual: ninguno.

## Session Log

### Session 001

- Fecha: 2026-05-07
- Goal: Implementar feature priority 1 `auth-email-password` (signup y login con email+password).
- Completado:
  - Commit inicial del scaffold (`4039bf8`).
  - Branch `feature/email-password-auth`.
  - DB tables creadas en Postgres local vía `bun db:push` (user, session, account, verification).
  - Cookies de Better-Auth condicionadas por `NODE_ENV` (dev: SameSite=Lax + Secure=false; prod: SameSite=None + Secure=true).
  - `register-form.tsx` reducido a email+password+confirmPassword per ADR-0007; wiring a `authClient.signUp.email` con `name: email` placeholder.
  - `login-form.tsx` wireado a `authClient.signIn.email` con toast genérico "Credenciales inválidas" per AUTH.md.
  - `routes/index.tsx` nuevo: landing autenticado-aware vía `authClient.useSession()`.
  - Schema Zod de register reducido (sin username/birthdate/strict-confirm).
- Verification run:
  - `bun check-types` (3 successful, 0 failed) ✅.
  - Curl: `POST /api/auth/sign-up/email` → 200 + cookie. `GET /api/auth/get-session` con la cookie → user. `POST /api/auth/sign-in/email` → 200; bad creds → 401 ✅.
  - Browser via Chrome DevTools MCP: signup en /register → redirige a / con "Sesión activa". Reload en / → persiste. Pestaña aislada en /login con bad creds → toast "Credenciales inválidas". /login con creds correctas → / con sesión ✅.
- Evidencia capturada:
  - DB: 4 users, 4 accounts (`provider_id="credential"`, password hash 161 chars), 5+ sessions activas.
  - Browser: snapshot del a11y tree confirma "Sesión activa: browser@example.com" tras login.
- Commits:
  - `4039bf8` chore: initialize meteor scaffold
  - `f214ce5` feat(auth): wire email and password signup and login
- Archivos o artifacts actualizados:
  - `packages/auth/src/index.ts`
  - `apps/web/src/features/auth/schemas/register.ts`
  - `apps/web/src/features/auth/components/register-form.tsx`
  - `apps/web/src/features/auth/components/login-form.tsx`
  - `apps/web/src/routes/index.tsx` (nuevo)
  - `apps/web/src/routeTree.gen.ts` (autogenerado por TanStack)
  - `feature_list.json`, `progress.md`, `session-handoff.md`
- Riesgo conocido o issue sin resolver:
  - Sin verificación de email (AUTH.md la exige antes de crear/joinear servers, no para login). Se cubrirá en `servers-create` o feature dedicada.
  - Sin rate limiting ni Cloudflare Turnstile (SECURITY.md). Deuda explícita.
  - No hay endpoint de logout ni protección formal de rutas; eso es feature priority 4 (`auth-session-logout`).
- Mejor siguiente paso: feature priority 2 `auth-oauth-google` — requiere agregar el plugin OAuth de Better-Auth y registrar la app en Google Cloud Console.
