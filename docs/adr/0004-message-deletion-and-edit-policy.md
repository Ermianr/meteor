# ADR 0004 — Política de borrado y edición de mensajes

**Status:** accepted

Los **Messages** se borran de forma lógica (soft delete) marcando `deletedAt` y `deletedBy` en la fila. Una tarea diaria purga (hard delete) los mensajes con `deletedAt < NOW() - 30 días`, cumpliendo el window razonable de eliminación de GDPR mientras deja margen de recuperación. Los edits **no** mantienen historial de versiones — solo se actualiza el `content` y se setea `editedAt`. La eliminación de cuenta de un **User** **anonimiza** sus mensajes (FK reapuntada a un user `[deleted]`) en lugar de hard delete cascade, para no romper conversaciones grupales.

## Quién puede borrar y cómo se ve

En MVP existen tres orígenes de borrado autorizado, todos limitados al ámbito **Server**:

- **Autor del mensaje** — borra el suyo.
- **Server Moderator** (un **Member** con el permission flag `MANAGE_MESSAGES` en alguno de sus Roles, aplicable al **Channel** del mensaje) — borra mensajes ajenos.
- **Owner del Server** (siempre tiene todos los flags vía `member.isOwner`) — equivalente al Server Moderator.

**Comportamiento de UI uniforme:** independientemente de quién borre, todos los clientes ven el mismo render — tombstone gris breve (5s) y luego el mensaje desaparece del scroll. No se etiqueta "Eliminado por moderador" ni se distingue visualmente al actor del borrado. La columna `deletedBy` se persiste solamente para auditoría y eventos de evlog (`message.delete`), no afecta el render.

**Platform Moderator** (staff de Meteor con poder cross-server) **no existe en MVP**. Cualquier borrado a nivel plataforma se difiere a Anillo 2 junto con el sistema de reportes y bans.

## Considered Options

- **Hard delete inmediato.** Rechazado porque crearía huecos en `seq` (rompiendo el contrato del ADR 0002), invalidaría los `replyToId` apuntando a mensajes borrados, y sería irreversible ante moderación errónea.
- **Soft delete con purga inmediata al pedir GDPR.** Rechazado porque el window de 30 días permite recuperación humana y al usuario reconsiderar.
- **Edits con historial de versiones.** Rechazado para MVP por costo de storage y UI; reconsiderar si llega un caso de moderación que lo necesite (Anillo 2+).
- **GDPR vía hard delete cascade del user.** Rechazado porque rompe conversaciones grupales con huecos sin tombstone para los demás participantes; anonimizar preserva la legibilidad.

## Consequences

- Las queries de carga inicial y paginación de mensajes filtran `WHERE deletedAt IS NULL` (no se devuelven mensajes borrados a clientes que llegan limpios — el tombstone breve solo aplica a clientes que ya tenían el mensaje en pantalla).
- El catch-up del WS al reconectar SÍ incluye filas con `deletedAt IS NOT NULL` para que el cliente que tenía el mensaje optimistic o cargado pueda reconciliar su estado y aplicar la animación de tombstone breve antes de quitarlo.
- Tabla `message` agrega `deletedAt timestamp NULL` y `deletedBy text NULL` (FK a `user.id`). `deletedBy` se usa solo para auditoría y eventos de evlog; no afecta render.
- Tarea programada diaria: `DELETE FROM message WHERE deletedAt < NOW() - INTERVAL '30 days'`. Implementación pendiente — puede ser cron job en el server o un worker, se decide al implementar.
- Eliminación de cuenta: en lugar de cascade, un service `deleteAccount(userId)` reapunta `message.authorId`, `reaction.userId`, etc. al user `[deleted]` sentinel; luego borra el `user` original. Las tablas que sí se borran cascade: `session`, `account`, `member`, `member_role`, `read_state`, `channel_mute`, `mention`, `direct_message_pair`. Las que se anonimizan: `message`, `reaction`, `invite.createdBy` (si aplica).
- El user sentinel `[deleted]` se crea en una migración inicial con `id` fijo conocido (e.g., `_deleted_user`), email NULL, username `[deleted]`, sin OAuth accounts.
