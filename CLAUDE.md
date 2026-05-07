# CLAUDE.md

Estás trabajando en un repositorio diseñado para trabajo de implementación de larga duración. Prioriza la finalización confiable, la continuidad entre sesiones y la verificación explícita por encima de la velocidad.

## Ciclo Operativo

Al inicio de cada sesión:

1. Ejecuta `pwd` y confirma que estás en la raíz esperada del repositorio.
2. Lee `progress.md`.
3. Lee `feature_list.json`.
4. Revisa los commits recientes con `git log --oneline -5`.
5. Verifica si el smoke test base o el flujo end-to-end ya está roto.

Luego selecciona exactamente una feature sin terminar y trabaja únicamente en esa feature hasta que la verifiques o documentes por qué está bloqueada.

## Reglas

- Solo una feature activa a la vez.
- No declares algo como completado sin evidencia ejecutable.
- No reescribas la lista de features para ocultar trabajo pendiente.
- No elimines ni debilites tests solo para hacer que la tarea parezca terminada.
- Usa los artefactos del repositorio como fuente oficial de verdad.
- Cuando modifiques comportamientos visibles al usuario, revisa `README.md` para verificar si la documentación necesita actualizarse.
- Antes de crear una PR nueva, asegúrate de crear una issue para la feature que vas a trabajar, si es que no existe ya.
- **Nombramiento de PRs (obligatorio):** seguir [Conventional Commits](https://www.conventionalcommits.org/). Formato: `<tipo>(<scope opcional>): <descripción imperativa, en inglés, en minúsculas, sin punto final>`. Tipos permitidos: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `build`, `ci`, `perf`, `revert`, `style`. Ejemplos válidos: `feat(auth): add github oauth provider`, `fix(db): prevent duplicate dm channels`, `chore(deps): bump drizzle-orm to 0.44`. Un PR cuyo título no cumpla este formato debe ser renombrado antes de merge — sin excepciones.
- **Nombramiento de branches (obligatorio):** usar exclusivamente `feature/<nombre-corto-descriptivo>` para trabajo nuevo o `fix/<nombre-corto-descriptivo>` para correcciones. El sufijo debe ser kebab-case (lowercase, palabras separadas por guiones), 2-5 palabras, en inglés, sin espacios ni guiones bajos ni mayúsculas. Ejemplos válidos: `feature/github-oauth`, `feature/dm-typing-indicator`, `fix/duplicate-dm-channels`. No se permite trabajar sobre `main` directamente, ni branches sin prefijo, ni nombres en español, ni `snake_case`, ni `camelCase`.

## Archivos Requeridos

- `feature_list.json`
- `progress.md`
- `session-handoff.md` cuando un handoff compacto sea útil

## Criterio de Finalización

Una feature solo puede pasar a estado `passing` después de que la verificación requerida sea exitosa y el resultado quede registrado.

## Antes de Detenerte

1. Actualiza el registro de progreso.
2. Actualiza el estado de la feature.
3. Registra qué sigue roto o sin verificar.
4. Haz commit una vez que el repositorio sea seguro para reanudar.
5. Deja un camino limpio de reinicio para la siguiente sesión.

# A tener en cuenta

- El directorio `docs/` y los archivos `CONTEXT.md`, `CLAUDE.md`, `feature_list.json`, `progress.md` y `session-handoff.md` de la raíz son artefactos internos de la IA y **no deben documentarse en `README.md`**.

## Referencias

- Consulta [./CONTEXT.md](./CONTEXT.md) para dudas sobre terminología.
- Consulta [./docs/architecture/REFERENCE.md](./docs/architecture/REFERENCE.md) para detalles sobre la arquitectura del proyecto.
- Consulta [./docs/adr](./docs/adr) para decisiones arquitectónicas importantes (Architecture Decision Records).
- Consulta [./docs/agents/issue-tracker.md](./docs/agents/issue-tracker.md) para el manejo de issues.

