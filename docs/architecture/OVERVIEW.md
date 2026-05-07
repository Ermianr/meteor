# OVERVIEW

Visión, diferenciador y alcance de Meteor.

---

## Diferenciador

UX fluida + paquete completo de features. No se sacrifica funcionalidad por minimalismo. La fluidez se traduce en números concretos:

- Acciones locales (UI sin red): **<16ms** (1 frame).
- Round-trip cliente → server → otros clientes: **<150ms P50 / <400ms P95**.
- Cambio de canal cacheado: **<50ms**.
- App-shell visible: **<800ms**.

Voz/video quedan fuera del Anillo 1.

---

## Alcance — Anillo 1

Funciones obligatorias:

- Auth (email+password + OAuth Google + OAuth GitHub).
- Servers/guilds con miembros e invitaciones por link.
- Canales de texto dentro de cada server.
- DMs 1-a-1.
- Mensajes en tiempo real con optimistic UI.
- Edit, delete, reply, reacciones emoji.
- Presencia (online/idle/dnd/offline) y typing indicators.
- Notificaciones in-app (sonido + tab title + favicon dot) + unread tracking.
- Markdown básico + bloques de código + previews de links.
- Subida de imágenes/archivos (R2 prod, MinIO dev).
- Búsqueda de mensajes (canal y server-wide).
- Roles básicos con permisos server-wide (Nivel 2).
- Mentions (`@user`, `@everyone`).
- Settings de usuario.
- Mute de canales.

---

## Anillo 2 (diferido)

Threads, pinned messages, DMs grupales, voz, roles con channel-overrides, bots/webhooks, server discovery público, push notifications, block, magic links, passkeys, signed URLs para privados, cross-server search, reportes/bans/word filter, RUM custom events.

## Anillo 3 (diferido)

Video/screen sharing, stages/events, stickers/GIFs animados, apps móviles nativas, E2E encryption.

---

## Stack base

Monorepo existente: Bun + Hono + TanStack Start + Drizzle + PostgreSQL + Better-Auth + shadcn/ui + Turborepo.
