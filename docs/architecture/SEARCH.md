# SEARCH

Búsqueda de mensajes y usuarios.

---

## Tecnología

**Postgres Full-Text Search nativo.**

- `to_tsvector('simple', content)` — sin stemming. Mejor para chat (mezcla idiomas, slang, código).
- Índice GIN.
- Abstracción `SearchProvider` con `searchMessages` y `searchUsers`.
- Migración futura a Meilisearch sin tocar código de aplicación.

---

## Operadores

- `from:username`
- `in:#channel`
- `has:link|image|file`

**Diferido a Anillo 2:** `before:`, `after:`, `mentions:`.

---

## Permisos en resultados

Join obligatorio con `channel_participant` y permisos de server. **Nunca** se devuelven mensajes de canales que el usuario no puede ver.

---

## UX

- `Cmd+K` command palette global.
- Barra de búsqueda dedicada por canal.

---

## Cross-server search

Diferido a Anillo 2.

---

## Targets de performance

| Acción | Target |
| --- | --- |
| Search en canal | <100ms P95 |
