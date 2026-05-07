# ADR 0006 — Creación atómica de Server y flujo de membresía

**Status:** accepted

La creación de un **Server** es una operación atómica que produce 5 filas en una sola transacción: `server`, `role` (`@everyone` con `isDefault: true`), `member` (owner con `isOwner: true`), `member_role` (owner ↔ `@everyone`), y `channel` (`#general`, `type: 'server_text'`). Si cualquiera falla, la transacción entera se revierte. El mismo patrón aplica al joineo via Invite, que es una transacción separada que valida + inserta `member` + asigna `@everyone` + incrementa `invite.uses`.

## Permisos base del rol `@everyone` al crearse

Por default, `@everyone` tiene activos:

- `VIEW_CHANNEL`
- `SEND_MESSAGES`
- `ADD_REACTIONS`
- `ATTACH_FILES`
- `CREATE_INVITE`

Inactivos por default:

- `MANAGE_MESSAGES`, `MANAGE_CHANNELS`, `MANAGE_SERVER`, `MANAGE_ROLES`
- `KICK_MEMBERS`, `BAN_MEMBERS`
- `MENTION_EVERYONE` (intencionalmente off — evita ruido masivo en Servers nuevos)

El owner puede editar estos flags después; típicamente para crear Servers tipo "anuncios" se quita `SEND_MESSAGES` de `@everyone` y se da a roles específicos.

## Reglas estructurales

- El rol con `isDefault: true` (`@everyone`) **no se puede borrar**, solo editar. El service rechaza `DELETE` y la UI no muestra el botón. Constraint enforced en `services/roles.ts`.
- El **owner** del Server (con `isOwner: true`) **siempre** tiene todos los permission flags efectivos, sin importar lo que diga `@everyone` u otros roles. Cómputo: `if (member.isOwner) return ALL_FLAGS`.
- El **owner** no puede ser kickeado ni perder permisos. Para "transferir" ownership, hay un flujo explícito (Anillo 2): el owner actual nombra a otro Member como nuevo owner; ambos quedan `isOwner: true` momentáneamente y luego el viejo se desmarca.

## Límites

- **Servers por User:** máximo 100 (chequeado en creación y en joineo via Invite). Cap absurdamente alto para un user normal pero corta abusos.
- **Members por Server:** sin cap hardcoded en MVP. La fluidez de fan-out ya está acotada por el cap de 200 en presencia (research/decisiones-mvp.md §7).
- **Channels por Server:** máximo 100. Ya hay rate limit de 30 channels/hora por Server; el cap absoluto evita Servers con miles de channels basura.

## Considered Options

- **Crear Server sin Channel inicial.** Rechazado: el primer joinee entraría a un Server vacío, UX mala.
- **`@everyone` con `MENTION_EVERYONE` activo por default.** Rechazado: en Servers grandes, esto causa abuso inmediato.
- **`@everyone` borrable.** Rechazado: `@everyone` es estructural; sin él, el cómputo de permisos falla para Members nuevos.
- **Sin límites en MVP.** Rechazado: abrir la puerta a abuso (Servers spam, joineo masivo) sin freno duro es invitar problemas tempranos.

## Consequences

- `services/servers.ts` exporta `createServer({ ownerId, name })` que ejecuta la transacción de 5 inserts. La función genera todos los `cuid2` antes de la transacción (necesario para el FK `member_role.memberId → member.id`).
- `services/invites.ts` exporta `joinViaInvite({ userId, code })` que valida + inserta `member` + asigna `@everyone` + incrementa `uses` en una transacción. Es **idempotente**: si el User ya es Member, devuelve el Member existente sin tocar nada.
- Constantes `BASE_EVERYONE_PERMISSIONS`, `MAX_SERVERS_PER_USER`, `MAX_CHANNELS_PER_SERVER` viven en `packages/shared/permissions.ts` y `packages/shared/constants.ts` respectivamente para que cliente y server las vean iguales.
- El cómputo de permisos efectivos en `services/permissions.ts`: `if (member.isOwner) return ALL_FLAGS; return BIT_OR(member.roles.permissions)`.
