# ADR 0001 — Username y Display Name: plugin Better-Auth + columnas custom

**Status:** accepted

Meteor requiere `username` único global (lowercase, `[a-z0-9_]`, 3-20 chars) editable con cooldown de 30 días, más `displayName` editable libre con Unicode (incluido emoji). Adoptamos un esquema **híbrido**: usamos el plugin oficial `username` de Better-Auth para la validación de unicidad, login por username y endpoints (`username` + `displayUsername` columns), y agregamos columnas propias `displayName` (libre, Unicode) y `usernameUpdatedAt` (timestamp del último cambio, base del cooldown). En lectura, el display visible se computa como `displayName ?? username` para que un `displayName` NULL caiga al username sin lógica especial.

## Considered Options

- **Plugin puro de Better-Auth.** Solo `username` + `displayUsername` (case-preserving del username). **Rechazado** porque `displayUsername` no es un nombre editable libre — sería forzar al usuario a usar el username case-modificado como nombre visible, perdiendo Unicode y emoji.
- **Custom completo sin plugin.** Manejar `username`, validación, unicidad, endpoints de cambio y login en código propio. **Rechazado** porque duplica trabajo bien resuelto por el plugin oficial y nos aleja del patrón mantenido upstream.

## Consequences

- El cooldown de 30 días vive en `services/users.ts`, no en el plugin: la lógica de "rechazar cambio si `now - usernameUpdatedAt < 30d`" es nuestra. El plugin desconoce el cooldown.
- Migración: la tabla `user` actual no tiene `username`, `displayUsername`, `displayName`, ni `usernameUpdatedAt`. La migración inicial agrega las cuatro columnas. Para usuarios ya registrados (si los hubiera), `username` arranca NULL y se requiere flujo de "elegí tu username" en primer login post-migración.
- En cualquier serializer (API, JSON cliente), siempre exponer un campo computado `displayName: user.displayName ?? user.username`. El cliente no decide.
