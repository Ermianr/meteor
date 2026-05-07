# Issue tracker: GitHub

Los issues de este repo viven como GitHub issues. Usa la CLI `gh` para todas las operaciones; el repo se infiere desde `git remote -v`.

## Cuándo crear un issue

Antes de cualquier código nuevo. Una issue por feature de `feature_list.json`. Si ya existe una issue abierta para el mismo `id`, reusarla en vez de crear otra.

## Título

Mismo formato que el PR final: [Conventional Commits](https://www.conventionalcommits.org/). Esto evita renombrar después.

Ejemplo: `feat(auth): add github oauth provider`.

## Body — plantilla mínima

```markdown
## User-visible behavior

<copiar literal de feature_list.json[].user_visible_behavior>

## Scope

<qué entra, una o dos frases>

## Decisiones de scope

- <qué queda fuera y por qué>
- <linkear ADR-NNNN cuando aplique; viven en docs/adr/>

## Done when

- <checklist verificable>
- `feature_list.json` marca este feature como `passing` con `verification` ejecutada y `evidence` actualizado.
```

## Labels

Usar las default del repo. No inventar nuevas.

- `enhancement` — features.
- `bug` — fixes.
- `documentation` — cambios solo de docs.

## Comandos `gh`

- **Crear**: `gh issue create --title "..." --body-file issue.md`. Preferir `--body-file` sobre heredoc — es cross-shell (PowerShell no soporta `<<EOF`).
- **Leer**: `gh issue view <n> --comments`.
- **Listar**: `gh issue list --state open --label enhancement`.
- **Comentar**: `gh issue comment <n> --body "..."`.
- **Labels**: `gh issue edit <n> --add-label "..."` / `--remove-label "..."`.

## Cerrar

Por defecto, el PR cierra la issue automáticamente: incluir `Closes #<n>` en el body del PR. Al merge, GitHub la cierra.

Usar `gh issue close <n> --comment "..."` solo para `wontfix`, `duplicate` o abandono explícito.

## Enlazar issue ↔ PR

1. El body del PR incluye `Closes #<n>` (autovincula + autocierra al merge).
2. Al pasar la feature a `passing` en `feature_list.json`, agregar la URL del issue y la del PR al campo `evidence`.
