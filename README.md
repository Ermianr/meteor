# Meteor

Plataforma de comunicación en tiempo real, con foco en UX fluida y feature-set completo.

## Estado

En construcción. La implementación está en sus primeras etapas.

## Stack

- **Runtime / package manager:** Bun
- **Backend:** Hono
- **Frontend:** TanStack Start + shadcn/ui
- **Base de datos:** PostgreSQL + Drizzle ORM
- **Auth:** Better-Auth
- **Monorepo:** Turborepo
- **Lint / format:** Biome

## Estructura

```
meteor/
├── apps/
│   ├── server/          # API Hono (HTTP + WebSocket)
│   └── web/             # Cliente TanStack Start
└── packages/
    ├── auth/            # Configuración Better-Auth compartida
    ├── config/          # Configuración compartida (env, etc.)
    ├── db/              # Schema Drizzle + migraciones
    └── ui/              # Componentes shadcn/ui compartidos
```

## Requisitos

- [Bun](https://bun.sh) `1.3.13` o superior
- Docker (para PostgreSQL local vía `db:start`)

## Quick start

```bash
bun install

# Levantar PostgreSQL local
bun db:start

# Aplicar el schema
bun db:push

# Levantar todo (web + server) en modo dev
bun dev
```

Para correr una sola app:

```bash
bun dev:web      # solo el cliente
bun dev:server   # solo la API
```

## Scripts

| Comando | Descripción |
|---|---|
| `bun dev` | Levanta todas las apps en modo dev (turbo). |
| `bun build` | Build de producción de todo el monorepo. |
| `bun check-types` | Type-check de todos los paquetes. |
| `bun check` | Lint + format con Biome (escribe cambios). |
| `bun check:ci` | Lint + format en modo CI (sin escribir). |
| `bun db:start` / `bun db:stop` | Arranca/detiene PostgreSQL local. |
| `bun db:push` | Sincroniza el schema Drizzle con la base de datos. |
| `bun db:migrate` | Aplica migraciones generadas. |
| `bun db:generate` | Genera una migración a partir del schema. |
| `bun db:studio` | Abre Drizzle Studio. |
| `bun db:watch` | Watch mode para cambios de schema. |
