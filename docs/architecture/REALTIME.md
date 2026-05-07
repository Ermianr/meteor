# REALTIME

Arquitectura de tiempo real: transporte WebSocket, contrato de mensajes, presencia, typing y notificaciones.

---

## Transporte

**WebSocket nativo de Bun, single-instance, estado en memoria.**

Toda lógica de fan-out detrás de una abstracción `PubSub` con dos implementaciones:

- `InMemoryPubSub` — activa en Anillo 1.
- `PostgresPubSub` (vía `LISTEN`/`NOTIFY`) — lista para activar al pasar a multi-instancia.

**Redis no se usa.** Postgres `LISTEN`/`NOTIFY` cubre el 95% del caso de uso de pub/sub sin agregar infra extra. Redis quedaría reservado para escala donde Postgres no aguante (decenas de miles de mensajes/segundo).

---

## Contrato de mensajes

- **Ordenamiento:** sequence number (`seq`) por canal, asignado por el server al insertar (`BIGSERIAL` con scope per-channel). No se usa Snowflake.
- **Catch-up al reconectar:** cliente envía `RESYNC { channelId, sinceSeq }`; server responde con todos los mensajes con `seq > sinceSeq` (cap 200; si hay más, refetch completo).
- **Idempotencia:** cliente genera `clientNonce` (UUID) por mensaje. Índice único `(channelId, clientNonce)` con `INSERT ... ON CONFLICT DO NOTHING RETURNING`.
- **Optimistic UI sin parpadeo:** cliente pinta el mensaje local con el `clientNonce` como key; al recibir el ack del server, reemplaza in-place.

### Forma del protocolo WS

```
Cliente → Server: { type: "send", channelId, clientNonce, content, replyToId? }
Server → emisor (ack): { type: "ack", clientNonce, message }
Server → otros (broadcast): { type: "message", message }
```

El protocolo se define como discriminated union de Zod en `packages/shared/src/ws-protocol.ts`.

---

## Presencia

- **4 estados:** `online` (WS conectado y pestaña activa), `idle` (5+ min sin interacción, automático), `dnd` (manual, persistido en `user_settings`), `offline`.
- **Invisible** → Anillo 2.
- **Heartbeat:** cliente cada N segundos. Server asume desconexión a los 60s sin heartbeat.
- **Estado de presencia en memoria del server** (`Map<userId, ...>`). Solo `dnd` persiste en `user_settings`.
- **Fan-out:** participantes de DMs activos + miembros de servers compartidos (cap 200). Lazy presence → Anillo 2.

---

## Typing indicators

- Debounce 3s en cliente.
- In-flight, no se persiste en DB.
- Reset 5s al recibir.

---

## Notificaciones

**Anillo 1:** sonido in-app, tab title dinámico (`(3) Meteor`), favicon con dot.

**Browser push (Web Push API)** → Anillo 2.

---

## Reconexión (targets)

| Métrica | Target |
| --- | --- |
| Detectar pérdida WS | <3s |
| Mostrar "Reconectando…" | después de 2s persistente |
| Reconectar | <1s post-detección |
| Catch-up | <500ms P95 |
