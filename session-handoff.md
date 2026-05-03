# Transferencia de Sesión

## Verificado Ahora

- Qué está funcionando actualmente:
  - `apps/web` compila (`tsc --noEmit` exit 0) y pasa Biome.
  - Vite dev arranca limpio en `http://localhost:3001`.
  - `/login` y `/register` SSR + interactivo: validación, estado submitting, navegación cruzada y date picker (Popover + Calendar en español) confirmados con chrome-devtools-mcp.
  - `auth-001` quedó en estado `passing` con evidencia completa.
- Qué verificación se ejecutó realmente:
  - `cd apps/web && bunx tsc --noEmit`
  - `bunx biome check apps/web/src/features apps/web/src/routes/login.tsx apps/web/src/routes/register.tsx packages/ui/src/lib/calendar-locales.ts`
  - `curl http://localhost:3001/login` y `/register` (200, contenido confirmado).
  - Chrome DevTools MCP: snapshots de a11y, fill_form, click, take_screenshot sobre ambas rutas y el date picker; los 7 pasos de `auth-001.verification` se ejecutaron y registraron en `auth-001.evidence`.

## Cambios en Esta Sesión

- Código o comportamiento añadido:
  - Feature `auth` en `apps/web/src/features/auth/` (schemas Zod + form components + barrel) — sólo UI visual, sin wiring a Better-Auth.
  - Rutas `/login` y `/register` (file-based) que renderizan los componentes del feature.
- Cambios en infraestructura o entorno de pruebas:
  - Generado `apps/web/src/routeTree.gen.ts` por el plugin `tanstackStart` al arrancar `vite dev`. No editar manualmente.
  - Ningún cambio en `package.json`, ni dependencias añadidas.

## Roto o No Verificado

- Defecto conocido: ninguno bloqueante.
- Ruta no verificada:
  - Ninguna pendiente para esta feature.
- Riesgo para la próxima sesión:
  - El submit de ambos formularios sólo simula latencia (`setTimeout(800)`). Reemplazar por llamadas reales a `authClient` requerirá decidir qué hacer con `username` y `birthdate` que no están en el schema actual de Better-Auth.
  - Detalle UX menor: el campo `birthdate` muestra dos mensajes cuando está vacío (`Selecciona una fecha` + `Fecha inválida`) porque ambas reglas de Zod fallan. Refinar el schema para que la regla de formato pase cuando el valor es vacío.

## Siguiente Mejor Paso

- Feature sin terminar de mayor prioridad: ninguna activa; hay que **definir la siguiente feature** en `feature_list.json`. Candidato natural: `auth-002` — wiring real de los formularios a Better-Auth (`signIn.email`, `signUp.email`), manejo de errores con toasts, redirección post-login. Incluye extender el schema de Drizzle (`packages/db/src/schema/auth.ts`) con `username` y `birthdate` o configurar `additionalFields` en Better-Auth.
- Qué no debe cambiar durante ese paso: la estructura `apps/web/src/features/auth/*` (componentes, schemas, barrel) y el patrón de validación con TanStack Form ya quedaron acordados.

## Comandos

- Inicio: `bun install` (root, una vez) y `bun run dev:web` (root, deja Vite en puerto 3001).
- Verificación:
  - `cd apps/web && bunx tsc --noEmit`
  - `bunx biome check apps/web/src/features apps/web/src/routes/login.tsx apps/web/src/routes/register.tsx`
  - Abrir `http://localhost:3001/login` y `http://localhost:3001/register` en un navegador.
- Comando de depuración específico:
  - `curl -i http://localhost:3001/login` y `/register` para confirmar SSR sin levantar UI.
  - Si `routeTree.gen.ts` se borra accidentalmente, basta con relanzar `bun run dev:web`: el plugin `tanstackStart` lo regenera al arrancar.
