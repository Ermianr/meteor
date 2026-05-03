# CLAUDE.md

Estás trabajando en un repositorio diseñado para tareas de implementación de larga duración. Da prioridad a la fiabilidad en la finalización, la continuidad entre sesiones y la verificación explícita, por encima de la velocidad.

## Loop de Trabajo

Al iniciar cualquier sesión:

1. Ejecuta `pwd` y confirma que estás en el root del repositorio.
2. Abre `claude-progress.md`.
3. Abre `feature_list.json`.
4. Ejecuta `git log --oneline -5`.
5. Ejecuta `.\init.ps1`.
6. Verifica si las pruebas básicas (baseline smoke) o el flujo completo (end-to-end path) están fallando.

Luego selecciona exactamente una feature sin terminar y trabaja únicamente en esa feature hasta que la verifiques o documentes por qué está bloqueada.

## Reglas

- Una sola feature activa a la vez.
- No declares que algo está terminado sin evidencia ejecutable.
- No reescribas la lista de features para ocultar trabajo sin terminar.
- No elimines ni debilites tests solo para que la tarea parezca completa.
- Usa los artefactos del repositorio como la fuente de verdad.
- Las features deben ser pull request jamás hacer un merge a main directo.
- Seguir el formato convencional de commits y escribir mensajes claros que expliquen el qué y el porqué del cambio (siempre en inglés). Ejemplos:
  - `ci: bootstrap GitHub Actions pipeline and Dependabot`
  - `feat(auth): add login and register views`
  - `fix(ui): correct date picker locale on Safari`
  - `chore(deps): bump @tanstack/react-router to 1.169.0`

## Archivos Requeridos

- `feature_list.json`
- `claude-progress.md`
- `init.ps1`
- `session-handoff.md` cuándo es útil una transferencia de sesión compacta

## Criterio de Finalización

Una feature solo puede pasar a `passing` después de que la verificación requerida se ejecute con éxito y el resultado quede registrado.

## Antes de Detenerte
- Actualiza el registro de progreso.
- Actualiza el estado de la feature.
- Registra qué sigue roto o no verificado.
- Haz commit cuando el repositorio sea seguro de retomar.
- Deja un punto de reinicio limpio para la siguiente sesión.

---

## Arquitectura por Features

Frontend y backend se organizan **por dominio de negocio**, no por tipo de archivo. Una feature es autocontenida: si la borras, solo se rompe lo que la usa explícitamente.

**Frontend — `apps/web/src/`**

```
features/
  auth/
    components/     # JSX específico del feature
    hooks/          # useLogin, useSession...
    schemas/        # Zod schemas del feature
    api/            # queryOptions, llamadas a server functions
    index.ts        # Barrel: API pública del feature
shared/             # UI primitiva, utils, helpers cross-feature
```

**Backend — `apps/api/src/`**

```
features/
  auth/
    routes.ts       # Hono router del feature
    service.ts      # Lógica de negocio
    repository.ts   # Acceso a datos
    schemas.ts      # Zod schemas (o re-export desde packages/shared)
    index.ts        # Barrel: router + tipos públicos
shared/             # Middleware, errores, utils cross-feature
```

**Reglas de la arquitectura**

- Una feature solo expone su `index.ts`. **Nadie** importa archivos internos de otra feature.
- Si dos features comparten algo, súbelo a `shared/` o a `packages/shared`.
- Schemas que cruzan frontend/backend viven en `packages/shared`; cada feature los re-exporta si los usa.
- Nombre del directorio = dominio en singular (`auth`, `billing`, `user`), no `auths` ni `authFeature`.
- Si una feature crece a >10 archivos por carpeta, divide en sub-features (`auth/login`, `auth/signup`).

## Estilo de Código

Biome es la fuente de verdad para formato y lint (`bun run check`). No discutas con él; arregla las advertencias antes del commit.

**Naming**

- `camelCase` para variables y funciones; `PascalCase` para componentes, tipos e interfaces; `SCREAMING_SNAKE_CASE` para constantes top-level.
- Booleanos con prefijo: `is`, `has`, `can`, `should`.
- Handlers: `handleX` dentro del componente, `onX` en las props.
- Hooks empiezan con `use`. Schemas Zod terminan en `Schema`. Tipos inferidos sin sufijo.

**TypeScript**

- `strict: true`. Prohibido `any`; usa `unknown` y refina.
- `type` para uniones y aliases; `interface` solo para extender contratos públicos.
- Infiere tipos desde schemas (`z.infer<typeof X>`); no dupliques.
- APIs públicas con tipo de retorno explícito; locales pueden inferirlo.

**Documentación**

- TSDoc (`/** */`) en APIs públicas, hooks compartidos, server functions y schemas no triviales.
- Los comentarios explican el **porqué**, no el **qué**. Si necesitas explicar el qué, renombra.
- `README.md` por paquete: propósito, scripts y dependencias clave.
