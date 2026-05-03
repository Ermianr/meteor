# Registro de Progreso

## Estado Actual Verificado

- Raíz del repositorio: `<project-root>\meteor`
- Ruta estándar de inicio: `bun install` (en root) y `bun run dev:web` (puerto 3001)
- Ruta estándar de verificación: `cd apps/web && bunx tsc --noEmit` y `bunx biome check .` desde root
- Feature sin terminar de mayor prioridad actual: ninguna; **auth-001** está `passing` tras verificación interactiva completa en navegador
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
