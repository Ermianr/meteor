# DEPLOYMENT

Hosting, CI/CD, migraciones de base de datos y setup local.

---

## Deployment

- **Plataforma:** Dokploy (open source, self-hosted, UI tipo Vercel).
- **Server, frontend, Postgres** corren en la misma instancia gestionada por Dokploy.
- **Reverse proxy + SSL:** Traefik built-in en Dokploy.
- **Backups Postgres:** auto-diarios a R2, retención 30 días.

---

## Storage externo

- **R2** (Cloudflare) para uploads.
- **Resend** para emails.
- **Axiom** para logs.

---

## CI/CD — GitHub Actions

**On PR:**

- Biome check.
- Type-check.
- Tests unit + integration.
- Build.
- Lighthouse CI.

**On merge a `main`:**

- Todo lo anterior.
- Deploy automático vía Dokploy webhook.

---

## Migraciones

**Automáticas desde el inicio**, con 6 safeguards:

1. Snapshot Postgres pre-deploy a R2.
2. Migraciones corren **antes** de arrancar el container nuevo (fail-fast).
3. CI bloquea migraciones peligrosas (`DROP TABLE`, `DROP COLUMN`, `ALTER ... NOT NULL`, `RENAME`) sin tag `[migration:dangerous]` en el commit.
4. Expand-and-contract pattern para cambios sobre tablas con datos.
5. Tests de migración en CI (Postgres efímero corre todas desde cero).
6. Backups diarios independientes del deploy.

---

## Setup local

`bun run setup` cross-platform en TypeScript:

1. Verifica Docker corriendo.
2. `docker-compose up -d` (postgres + mailpit + minio + minio-init).
3. Espera a que Postgres esté listo.
4. `bun run db:push`.
5. Opcional: `bun run db:seed` (datos demo).
6. Imprime resumen de URLs.

---

## Variables de entorno

- `.env.local` (gitignored) + `.env.example` por app.
- Validación con Zod schema en `packages/config`.
- **Fail-on-boot** si falta secret crítico.
