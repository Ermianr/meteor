# Registro de Progreso

## Estado Actual Verificado

- Raíz del repositorio: `<project-root>\meteor`
- Ruta estándar de inicio: `bun install` (en root) y `bun run dev:web` (puerto 3001)
- Ruta estándar de verificación local (alineada con CI): `bun run check:ci`, `bun run build`, `bun run check-types` desde el root
- Feature sin terminar de mayor prioridad actual: **ci-cd-001** (status `in_progress`) — verificación local completa, falta confirmar el primer run verde del workflow en GitHub Actions tras push
- Bloqueo actual: ninguno

## Registro de Sesiones

### Sesión 001

- Fecha: 2026-05-02
- Objetivo: implementar `auth-001` — vistas de login y registro (sólo UI visual, sin wiring a Better-Auth) y verificarlas extremo-a-extremo en navegador.
- Completado:
  - Plan acordado con el usuario (alcance UI-only, rutas `/login` y `/register`, campos definitivos para cada formulario).
  - Creados schemas Zod en `apps/web/src/features/auth/schemas/{login,register}.ts`.
  - Creados componentes `LoginForm` y `RegisterForm` en `apps/web/src/features/auth/components/` usando `@tanstack/react-form` y los primitivos `Button`, `Input`, `Label`, `Card*` de `@meteor/ui`.
  - Creado barrel `apps/web/src/features/auth/index.ts` (sólo expone `LoginForm` y `RegisterForm`).
  - Creadas rutas file-based `apps/web/src/routes/login.tsx` y `register.tsx`.
  - Generado `apps/web/src/routeTree.gen.ts` arrancando `vite dev` (lo crea el plugin `tanstackStart`).
- Ejecución de verificación:
  - `cd apps/web && bunx tsc --noEmit` → exit 0, sin errores.
  - `bunx biome check apps/web/src/features apps/web/src/routes/login.tsx apps/web/src/routes/register.tsx` → 0 errores / 0 warnings tras `--write` (orden de imports ajustado por Biome).
  - `bun run dev` en `apps/web` arrancó Vite v8.0.10 en `http://localhost:3001/` y `[vite] (ssr) connected.` sin errores.
  - `curl http://localhost:3001/login` → HTTP 200, 7306 bytes; HTML contiene `Iniciar sesión`, `Correo electrónico`, `Contraseña`, `Regístrate`, atributos `aria-invalid`.
  - `curl http://localhost:3001/register` → HTTP 200, 14547 bytes (con date picker); HTML contiene `Crear cuenta`, `Nombre de usuario`, `Fecha de nacimiento`, `Selecciona una fecha`, `popover-trigger`, `Confirmar contraseña`, `Inicia sesión`.
  - **Verificación interactiva con chrome-devtools-mcp** (sesión guiada por el usuario):
    - `/login`: snapshot a11y muestra los 8 elementos esperados; submit vacío → ambos textbox quedan `invalid=true`, alerts `Correo inválido` y `Mínimo 8 caracteres`, botón `disabled`. Datos válidos → errores se limpian, ~800ms en estado submitting, sin errores en consola.
    - Link `Regístrate` navega a `/register`.
    - `/register`: el botón "Fecha de nacimiento" abre un `dialog` con el calendario en español (`enero 2000`, opciones `ene–dic`, años 1900–2026, días con label `sábado, 15 de enero de 2000`). Al seleccionar un día queda `seleccionado`; tras cerrar con Escape el botón muestra "15 de enero de 2000" (verificado por screenshot).
    - Submit con `username='kg'` y passwords distintas → alerts `Mínimo 3 caracteres` y `Las contraseñas no coinciden`. Submit válido completo → sin errores ni mensajes en consola.
  - **Fix `noValidate`**: tras detectar que el atributo `type="email"` disparaba el popup nativo de HTML5 (interceptando el submit antes de Zod), se añadió `noValidate` al `<form>` de login y register. Re-verificado: ahora con email malformado se muestra `Correo inválido` de Zod en su FieldError, sin popup del navegador.
- Evidencia recopilada: ver bloque `evidence` en `feature_list.json` para `auth-001`.
- Commits: ninguno todavía (pendiente autorización del usuario).
- Archivos o artefactos actualizados:
  - Nuevos: `apps/web/src/features/auth/schemas/login.ts`, `apps/web/src/features/auth/schemas/register.ts`, `apps/web/src/features/auth/components/login-form.tsx`, `apps/web/src/features/auth/components/register-form.tsx`, `apps/web/src/features/auth/index.ts`, `apps/web/src/routes/login.tsx`, `apps/web/src/routes/register.tsx`.
  - Generado por el plugin: `apps/web/src/routeTree.gen.ts`.
  - Editados: `feature_list.json` (status `in_progress`, verification, evidence), `claude-progress.md` (este archivo), `session-handoff.md`.
- Riesgo conocido o problema no resuelto:
  - El submit es un `setTimeout(800)` placeholder marcado con `// TODO(auth wiring)` — debe reemplazarse por `authClient.signIn.email` / `signUp.email` en una feature posterior.
  - Better-Auth schema actual no tiene `username` ni `birthdate`; cuando se haga el wiring habrá que extender `packages/db/src/schema/auth.ts` o usar `additionalFields`.
  - El campo `birthdate` muestra dos errores cuando está vacío (`Selecciona una fecha` + `Fecha inválida`) porque la `.refine` de Zod corre incluso cuando `.min(1)` falla. Mejorable haciendo que la refine pase cuando el valor es "".
- Siguiente mejor paso: definir la próxima feature en `feature_list.json` (probablemente el wiring real a Better-Auth, incluyendo extensión del schema de Drizzle para `username` y `birthdate`, y el manejo de respuestas/redirección post-login).

### Sesión 002

- Fecha: 2026-05-03
- Objetivo: implementar `ci-cd-001` — GitHub Actions (lint + build + type-check en push a main y PRs) y Dependabot (npm + github-actions, semanal con grouping). Verificar que el flujo local que el CI ejecutará pasa verde end-to-end.
- Completado:
  - Plan acordado con el usuario (`C:\Users\Kevin Garcia\.claude\plans\aborda-las-tareas-pendientes-recursive-balloon.md`).
  - Añadido script `check:ci` (`biome check .` sin `--write`) al `package.json` del root, dejando `check` (con `--write`) intacto para uso local.
  - Añadido script `check-types` (`tsc --noEmit`) a `apps/web/package.json` para que entre en `bun run check-types` (turbo).
  - Creado `.github/workflows/ci.yml`: dispara en push a `main` y PRs a `main`; pasos = checkout, setup-bun@v2 (bun 1.3.13), install --frozen-lockfile, check:ci, build, check-types; concurrencia con cancel-in-progress y timeout de 15 min.
  - Creado `.github/dependabot.yml`: ecosistema `npm` (root, weekly lunes 06:00 America/Bogota, grouping minor/patch, prefix `chore(deps)`) y `github-actions` (weekly, grouping all incluido majors, prefix `chore(ci)`).
  - Saneo de Biome preexistente: `bun run check` (con --write) auto-corrigió 18 archivos (semicolons, trailing commas, organize imports). Quedaron 5 errores no auto-fixeables, todos arreglados con criterio:
    - `apps/web/src/routes/__root.tsx`: `RouterAppContext = {}` → `Record<string, never>`.
    - `packages/ui/src/components/field.tsx`: `==` → `===` (FIXABLE-unsafe que se aplicó manualmente).
    - `packages/ui/src/components/field.tsx`: `key={index}` → `key={error.message}` (los errores ya están deduplicados por message).
    - `packages/ui/src/components/field.tsx`: `<div role="group">` → `biome-ignore lint/a11y/useSemanticElements` con justificación (Field envuelve un único campo; FieldSet ya cubre la agrupación lógica con `<fieldset>`).
    - `packages/ui/src/components/label.tsx`: `<label>` sin htmlFor → `biome-ignore lint/a11y/noLabelWithoutControl` con justificación (primitivo shadcn; htmlFor se inyecta en el call site).
- Ejecución de verificación local:
  - `bun install --frozen-lockfile` → "no changes" (lockfile sincronizado).
  - `bun run check:ci` → "Checked 63 files in 49ms. No fixes applied." (0 errores, 0 warnings).
  - `bun run build` → 2 tasks successful (server build 192ms via tsdown; web build 1.19s client + 616ms ssr via vite) en 3.316s; regenera `apps/web/src/routeTree.gen.ts`.
  - `bun run check-types` → 3 tasks successful (@meteor/ui, server, web) en 5.88s.
- Verificación remota pendiente: el `passing` formal requiere abrir PR contra `main` y obtener al menos un run verde del workflow `CI` en GitHub Actions. Mientras eso no ocurra, `ci-cd-001` queda en `in_progress`.
- Archivos o artefactos actualizados:
  - Nuevos: `.github/workflows/ci.yml`, `.github/dependabot.yml`.
  - Editados (script): `package.json` (root), `apps/web/package.json`.
  - Editados (saneo Biome auto-fix de 18 archivos): `apps/server/src/index.ts`, `apps/web/src/middleware/auth.ts`, `packages/auth/src/index.ts`, `packages/db/src/{index.ts,schema/auth.ts,schema/index.ts}`, `packages/ui/src/components/{button,calendar,card,checkbox,dropdown-menu,input,popover,separator,sonner}.tsx`, `packages/ui/src/lib/utils.ts`, `CLAUDE.md`.
  - Editados (saneo Biome manual): `apps/web/src/routes/__root.tsx`, `packages/ui/src/components/field.tsx`, `packages/ui/src/components/label.tsx`.
  - Actualizados: `feature_list.json` (`ci-cd-001` con verification + evidence local), `claude-progress.md` (este archivo), `session-handoff.md`.
- Riesgo conocido o problema no resuelto:
  - **Dependabot + bun.lock**: el primer PR de Dependabot puede romper `bun install --frozen-lockfile` si edita `package.json` sin actualizar `bun.lock`. Si pasa, follow-up = añadir un workflow `dependabot-sync-lock.yml` que en branches `dependabot/*` corra `bun install` y commitee el lock de vuelta.
  - **Branch protection**: hay que activar manualmente en GitHub que la check `CI / verify` sea required para merger en `main`. No se puede hacer desde el repo.
  - **Sin tests automatizados**: el CI no corre tests porque no existen. Cuando `auth-002` (wiring Better-Auth) añada lógica real, considerar `services: postgres` + `bun test` o vitest.
  - **Sin cache**: si el job supera ~3 min, añadir `actions/cache` para `~/.bun/install/cache` y `.turbo/`.
- Siguiente mejor paso: hacer commit de todos los cambios (workflow + dependabot + saneo Biome + scripts + docs), pushear a una rama feature (`feat/ci-cd-001`), abrir PR contra `main`, esperar al run verde, registrar la URL en `evidence` y mover `ci-cd-001` a `passing`.
- **Ejecutado al final de la sesión 002**:
  - Commit `0a5e624` ("ci: bootstrap GitHub Actions pipeline and Dependabot") en rama `feat/ci-cd-001`.
  - Push a `origin/feat/ci-cd-001`.
  - PR #3 abierto: https://github.com/Ermianr/meteor/pull/3.
  - Job "Lint, build & typecheck" → pass en 24s. Run: https://github.com/Ermianr/meteor/actions/runs/25271145783.
  - Otros checks del repo (no parte de `ci-cd-001`): GitGuardian pass, CodeQL Analyze pending, CodeRabbit pending — son herramientas externas.
  - **Falta**: mergear el PR (decisión del usuario), confirmar el run verde sobre `main`, registrar esa URL y mover `ci-cd-001` a `passing`.
  - Aviso del runner: `actions/checkout@v4` corre en Node.js 20 (deprecated a partir de 2026-06-02). Dependabot lo actualizará a v5 cuando esté disponible — no requiere acción manual.
