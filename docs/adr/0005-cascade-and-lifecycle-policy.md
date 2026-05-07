# ADR 0005 — Cascadas y ciclo de vida de Server, Channel, Member

**Status:** accepted

Adoptamos política diferenciada por entidad según si representa **contenido** o **estado vivo**:

- **Server, Channel, Message** → soft delete con `deletedAt` + purga periódica a los 30 días. Recuperables dentro del window. Coherente con ADR 0004.
- **Member, member_role** → hard delete inmediato cuando el **User** se va o es kickeado. La membresía es estado vivo, no contenido; si vuelve, es una nueva fila.
- **session, account** (tablas de Better-Auth) → hard delete inmediato vía cascade real al borrar el `User`.

En el schema Drizzle **no** se declaran `onDelete: 'cascade'` en las foreign keys de tablas con soft delete. La purga periódica es responsabilidad de un service explícito (`services/cleanup.ts`) que ejecuta los DELETEs en orden topológico dentro de una transacción.

## Visibilidad del soft-deleted Server

Un Server marcado como `deletedAt IS NOT NULL`:

- **Desaparece inmediatamente** del sidebar de los **Members** (que dejan de tener acceso al instante).
- **Sigue visible solo al owner** en una pantalla "Servers eliminados" en sus settings, con botón "Restaurar" disponible durante los 30 días.
- Pasados los 30 días, el cleanup borra el Server y sus dependencias en cascada manual (channels → messages → reactions/mentions → roles → invites → channel_participants → server).

## Considered Options

- **Hard cascade en Drizzle (`onDelete: 'cascade'`).** Rechazado: incompatible con soft delete; un DELETE accidental borraría todo en cascada sin window de recuperación.
- **Soft delete también de Member.** Rechazado: la membresía no es contenido; mantenerla soft-deleted complica queries vivas (membership active vs historical) sin beneficio real para el usuario.
- **Transfer de ownership obligatorio antes de borrar Server.** Rechazado: agrega fricción para casos legítimos (owner único decide cerrar el Server); el window de 30 días ya da margen humano.
- **Window de purga distinto al de mensajes.** Rechazado: 30 días unificado en todo el dominio simplifica el modelo mental para users y operadores.

## Consequences

- `services/cleanup.ts` corre como tarea programada (cron job o worker — implementación pendiente). Borra en este orden, dentro de transacción: `reaction`, `mention`, `read_state`, `channel_mute`, `message`, `channel_participant`, `channel`, `member_role`, `member`, `role`, `invite`, `server`. Aplica solo a filas con `deletedAt < NOW() - INTERVAL '30 days'`.
- Las tablas de Better-Auth (`session`, `account`, `verification`) **sí** declaran `onDelete: 'cascade'` desde `user`, porque el flujo de eliminación de cuenta del ADR 0004 las borra duro tras anonimizar los messages.
- Cuando un Member es kickeado, su `read_state`, `channel_mute` y `mention` específicos del Server se borran junto con `member` y `member_role`, dentro de la misma transacción del kick. Sus messages anteriores quedan intactos (autor sigue siendo un User válido).
- Cuando un User se desvincula de la plataforma (ADR 0004), el flujo de anonimización corre antes; al final el `user` original puede borrarse hard, lo que cascadea sus `session`, `account`, `verification`. Las membresías ya se habrían eliminado al desligarse de cada Server, o se borran como parte del flujo.
- La pantalla "Servers eliminados" del owner es feature de UI a implementar como parte del módulo de settings; los datos están disponibles vía `WHERE owner_id = $userId AND deletedAt IS NOT NULL AND deletedAt > NOW() - INTERVAL '30 days'`.
