# Meteor

Plataforma de comunicación en tiempo real, con foco en UX fluida y feature-set completo. Este documento define el lenguaje canónico del dominio.

## Language

### Identidad

**User**:
Persona registrada en la plataforma. Identificado globalmente por `username` único.
_Avoid_: Account, profile, member (cuando se refiere al usuario global)

**Username**:
Identificador único global de un **User**, lowercase, `[a-z0-9_]`, 3-20 caracteres, editable con cooldown.
_Avoid_: Handle, login, alias

**Display Name**:
Nombre visible y editable de un **User**, libre, Unicode permitido. Default = username al registrarse.
_Avoid_: Nick, name, full name

**Session**:
Token autenticado activo de un **User** en un dispositivo concreto. Multi-device: un User puede tener varias.

### Espacios y participación

**Server**:
Espacio comunitario que agrupa **Channels** y **Members**. Tiene un owner, roles, e invitaciones. Privado por default; flag `isDiscoverable` controla visibilidad pública futura.
_Avoid_: Guild, workspace, group, community

**Member**:
La pertenencia de un **User** a un **Server** específico. Distinto del User: un User puede ser Member de varios Servers, y la membership lleva sus propios roles, fecha de unión, etc.
_Avoid_: Participant (reservado para canales), subscriber

**Role**:
Conjunto nombrado de permisos dentro de un **Server**. Asignable a varios **Members**. El rol especial `@everyone` (`isDefault = true`) se asigna automáticamente a cada Member nuevo.
_Avoid_: Group, permission group

**Permission Flag**:
Bit individual dentro del bitfield (`BIGINT`) de un **Role**. Los 12 flags MVP (`VIEW_CHANNEL`, `SEND_MESSAGES`, etc.) están definidos en `packages/shared/permissions.ts`.
_Avoid_: Capability, ability, grant

**Invite**:
Código compartible que permite a un **User** unirse a un **Server**. Tiene `maxUses` y `expiresAt` opcionales.
_Avoid_: Token (reservado para sesiones), link

### Comunicación

**Channel**:
Conducto de mensajes. Tiene dos tipos: `server_text` (vive dentro de un **Server**) y `dm` (conversación 1-a-1 entre dos **Users**, sin Server). Modelo unificado: una sola tabla.
_Avoid_: Room, conversation (excepto cuando se refiere a la UI de DMs específicamente)

**Channel Participant**:
Un **User** que tiene acceso a un **Channel**. Para DMs, los 2 users involucrados; para canales de Server, se computa de la membresía + permisos.
_Avoid_: Subscriber, watcher

**Direct Message (DM)**:
**Channel** de tipo `dm` con exactamente 2 Channel Participants. La unicidad entre dos Users se garantiza con `direct_message_pair { lowUserId, highUserId }`.
_Avoid_: Private message (ambiguo con permisos), chat

**Message**:
Unidad atómica de comunicación dentro de un **Channel**. Tiene un `seq` monotónico per-channel asignado por el server.
_Avoid_: Post, entry, item

**Sequence Number (`seq`)**:
Número monotónico crecientes per-**Channel** que define el orden canónico de **Messages** y permite el catch-up al reconectar.
_Avoid_: Index, position, ID (id es independiente)

**Client Nonce**:
UUID generado por el cliente antes de enviar un **Message**, usado para idempotencia (no duplicar al reintentar) y para reemplazar el placeholder optimista al recibir el ack.
_Avoid_: Request ID, dedup key

**Mention**:
Referencia explícita a un **User** o `@everyone` dentro del texto de un **Message**. Se persiste en tabla aparte para badges rojos diferenciados de unread normal.

**Reaction**:
Emoji asociado a un **Message** por un **User**. Múltiples Users pueden reaccionar con el mismo emoji.

### Estado vivo

**Presence**:
Estado actual de un **User** observado por otros: `online`, `idle`, `dnd`, `offline`. Vive en memoria del server (excepto `dnd` que persiste en `user_settings`).
_Avoid_: Status (overcargado), availability

**Typing Indicator**:
Señal in-flight de que un **User** está escribiendo en un **Channel**. No se persiste; se broadcast vía WebSocket con debounce 3s + reset 5s.

**Read State**:
Marca per-(**User**, **Channel**) que indica el `lastReadSeq` que el User ya vio. Unread se computa cliente-side como `currentSeq - lastReadSeq`.
_Avoid_: Last seen (ambiguo con presencia)

**Channel Mute**:
Marca per-(**User**, **Channel**) que silencia notificaciones (sigue contando unreads, pero sin sonido/badge rojo).

## Relationships

- A **User** can be a **Member** of many **Servers**.
- A **Server** has many **Members** and many **Channels** (type `server_text`).
- A **Server** has many **Roles**; one of them is the special `@everyone`.
- A **Member** has many **Roles** (always at least `@everyone`).
- A **DM** is a **Channel** with type `dm` and exactly 2 **Channel Participants** (both **Users**).
- A **Channel** has many **Messages**, ordered by `seq`.
- A **Message** belongs to exactly one **Channel** and is authored by one **User**.
- A **Message** can have many **Reactions** and produce many **Mentions**.
- A **Permission Flag** is OR-ed across all **Roles** of a **Member** to compute effective permissions.

## Example dialogue

> **Dev:** "Cuando un **User** es kickeado de un **Server**, ¿qué pasa con sus **Mentions** sin leer?"
> **Domain expert:** "El **User** deja de ser **Member**, así que pierde acceso a los **Channels** del **Server**. Los registros en `mention` quedan huérfanos pero no se borran — si vuelve al **Server**, los recupera. Si no, son ruido sin badge porque no puede ver el **Channel**."
>
> **Dev:** "¿Y si el kicked **User** y yo compartimos un **DM**?"
> **Domain expert:** "El **DM** es independiente del **Server**. El kick no toca esa relación. Sigue siendo **Channel Participant** del **DM**."

## Flagged ambiguities

- **"Channel"** — usado tanto para canales de Server como para DMs. Resuelto: es un solo concepto (`Channel`) con campo `type`. Cuando importe distinguir, decir "server-text channel" o "DM".
- **"Account"** — evitado deliberadamente. Confunde con la tabla `account` de Better-Auth (que registra OAuth providers vinculados al User). No usar "account" para referirse al User.
- **"Member"** vs **"User"** — distintos. User es global; Member es la pertenencia a un Server específico.
- **"Status"** — evitado por overcarga. Usar **Presence** para online/offline, y nombres específicos para otros estados (e.g., "message status" sería su propio término si se introduce).
- **"DM"** vs **"Direct Message"** — sinónimos. La forma corta domina en UI, la larga en docs.
