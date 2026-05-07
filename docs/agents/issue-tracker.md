# Issue tracker: GitHub

Los issues de este repo viven como GitHub issues. Usa la CLI `gh` para todas las operaciones.

## Convenciones

- **Crear un issue**: `gh issue create --title "..." --body "..."`. Usa un heredoc para bodies multilínea.
- **Leer un issue**: `gh issue view <number> --comments`, filtrando los comments con `jq` y obteniendo también los labels.
- **Listar issues**: `gh issue list --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'` con los filtros `--label` y `--state` apropiados.
- **Comentar en un issue**: `gh issue comment <number> --body "..."`
- **Aplicar / remover labels**: `gh issue edit <number> --add-label "..."` / `--remove-label "..."`
- **Cerrar**: `gh issue close <number> --comment "..."`

Infiere el repo desde `git remote -v` — `gh` lo hace automáticamente cuando se ejecuta dentro de un clone.
