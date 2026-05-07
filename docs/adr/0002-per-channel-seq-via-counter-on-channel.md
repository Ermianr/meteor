# ADR 0002 — Sequence per-channel vía counter en `channel`

**Status:** accepted

Cada **Channel** necesita una numeración monotónica propia (`seq`) para ordenar **Messages** y permitir catch-up al reconectar. Postgres no soporta nativamente "sequence per-fila-de-otra-tabla", así que implementamos esto manteniendo un counter (`next_seq`) en la tabla `channel` e incrementándolo dentro de la transacción del INSERT del Message. La misma transacción actualiza `last_message_at` en el mismo UPDATE para evitar un round-trip extra. El `seq` arranca en 1 para el primer Message; `seq = 0` queda reservado para `read_state.lastReadSeq` significando "el User aún no vio ningún Message de este Channel".

## Considered Options

- **Postgres `BIGSERIAL`.** Solo soporta scope global, no per-channel. Inadecuado.
- **`MAX(seq) + 1` en INSERT sin lock.** Race condition: dos inserts concurrentes pueden colisionar con el mismo seq. Rechazado.
- **`CREATE SEQUENCE` por canal.** Genera miles de objetos en el catalog de Postgres (uno por Channel), degrada backups y planner. Anti-pattern. Rechazado.
- **Advisory locks per-channel + `MAX(seq) + 1`.** Funciona pero introduce un tipo de lock que el dev nuevo no espera leyendo el código. Reservado como fallback si la contención del row-lock de la opción adoptada se vuelve un problema medible.
- **Counter gap-tolerant con CAS optimista.** Permite huecos en la numeración (`seq` salta de 47 a 49). Complica el cliente al hacer catch-up. Rechazado para MVP; reconsiderar si llegamos a multi-region.

## Consequences

- El INSERT de Message requiere transacción explícita: `UPDATE channel ... RETURNING next_seq - 1 AS seq` + `INSERT INTO message ...`. Si el INSERT falla (e.g., FK inválida en `replyToId`), el rollback revierte el incremento — sin huecos.
- El UPDATE toma row-lock sobre el row del **Channel**. En canales con muchos escritores concurrentes (>50 simultáneos), las inserciones se serializan. En MVP esto es invisible (~5ms agregados); si llega a notarse, migrar a advisory locks (cambio local, solo en `services/messages.ts`).
- `next_seq` en `channel` también sirve como "currentSeq" del canal, evitando un `SELECT MAX(seq)` separado para queries de unread count o paginación.
- `read_state.lastReadSeq` arranca en 0 para Members nuevos. Cualquier `lastReadSeq < currentSeq` significa "hay unreads"; `lastReadSeq = 0` significa "nunca leyó este canal".
