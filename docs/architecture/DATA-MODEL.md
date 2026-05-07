# DATA MODEL

Modelo de datos de Meteor en Drizzle + PostgreSQL.

Schemas viven en `packages/db/src/schema/`.

---

## Servers (guilds)

**Modelo híbrido.** Servers privados por default + flag `isDiscoverable` en schema. La UI de directorio público se difiere al Anillo 2.

### Invitaciones

Tabla `invite { code, serverId, expiresAt NULL, maxUses NULL, uses }`. Flexible: links sin expirar / sin tope de uso son válidos.

---

## Permisos — Nivel 2

- Roles custom server-wide con flags en bitfield (`BIGINT`).
- 12 flags:
  - `VIEW_CHANNEL`, `SEND_MESSAGES`, `MANAGE_MESSAGES`, `ADD_REACTIONS`,
    `ATTACH_FILES`, `MENTION_EVERYONE`, `MANAGE_CHANNELS`, `KICK_MEMBERS`,
    `BAN_MEMBERS`, `MANAGE_SERVER`, `CREATE_INVITE`, `MANAGE_ROLES`.
- **`@everyone` es un rol explícito** (`role.isDefault = true`), creado al crear el server, asignado automáticamente a cada miembro nuevo.
- Cómputo de permisos: `BIT_OR` de todos los roles del miembro. Sin caso especial.
- Owner siempre tiene todos los permisos vía flag `member.isOwner`.
- **Channel overrides → Anillo 2** (Nivel 3). Schema de Nivel 2 es aditivo: pasar a Nivel 3 solo agrega `channel_permission_override`.

---

## Canales y DMs (modelo unificado)

Una sola tabla `channel` con `type ENUM('server_text','dm')` y `serverId NULL` para DMs.

- `channel_participant { channelId, userId }` lista los participantes.
- Tabla `direct_message_pair { channelId, lowUserId, highUserId }` con índice único `(low, high)` para garantizar **1 DM 1-a-1** entre A y B.
- Creación híbrida: el cliente busca DM existente; si no existe, lo crea y abre.
- `lastMessageAt` en `channel` para ordenar lista de DMs.
- **Mute** (tabla `channel_mute`) entra en Anillo 1.
- **Block diferido a Anillo 2.**

---

## Mensajes

Una sola tabla `message` para canales de server y DMs.

Campos clave:

- `id`
- `channelId`
- `seq` — `BIGSERIAL` con scope per-channel
- `authorId`
- `content`
- `clientNonce` — UUID por mensaje, índice único `(channelId, clientNonce)`
- `replyToId`
- `editedAt`
- `deletedAt`
- `createdAt`

---

## Read state y mentions

- `read_state { userId, channelId, lastReadSeq, lastReadAt }`. Unread = `currentSeq - lastReadSeq` (cómputo en cliente).
- `mention { userId, channelId, messageId, messageSeq, seen }` — para badges rojos diferenciados de unread normal.

---

## Tablas iniciales

`user`, `session`, `server`, `member`, `role`, `member_role`, `channel`, `channel_participant`, `direct_message_pair`, `message`, `mention`, `read_state`, `channel_mute`, `invite`, `attachment`, `user_settings`.
