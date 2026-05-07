# MONOREPO

Estructura del monorepo. Turborepo + Bun workspaces.

---

## Layout

```
apps/
├── server/                       # Hono app (apps/server)
│   └── src/
│       ├── routes/
│       ├── lib/
│       ├── services/
│       ├── ws/
│       └── index.ts
├── web/                          # TanStack Start app
│   └── src/
│       ├── routes/               # file-based routing
│       ├── components/
│       ├── lib/{ws, api, auth}/
│       └── ...
packages/
├── auth/                         # Better-Auth config (existente)
├── config/                       # Zod env schema (existente)
├── db/                           # Drizzle schemas (existente)
├── ui/                           # shadcn primitives (existente)
└── shared/                       # NUEVO: types + Zod + constants compartidos
    └── src/
        ├── ws-protocol.ts        # discriminated union de mensajes WS
        ├── api-contracts.ts      # DTOs REST
        ├── permissions.ts        # bitfield flags
        └── constants.ts          # límites compartidos
```

---

## Filosofía

**Cero premature modularization.**

- **No** se crean `packages/realtime`, `packages/messaging`, ni similares.
- Un nuevo `package` solo se justifica cuando dos consumers diferentes lo necesitan, no por separación conceptual.
- `packages/shared` existe únicamente porque cliente y server necesitan los mismos tipos (WS protocol, DTOs, bitfields, constantes).

---

## Stack base

- Bun (runtime + workspaces + tests).
- Turborepo (cache + pipelines).
- TanStack Start + Router + Query (frontend).
- Hono (backend HTTP + WS).
- Drizzle + PostgreSQL.
- Better-Auth.
- shadcn/ui.
