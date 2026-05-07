# PERFORMANCE

Performance budget de Meteor. Estos números son **gates de release**, no aspiraciones.

---

## Acciones locales

| Acción | Target |
| --- | --- |
| Mensaje send → paint local (optimistic) | <16ms (1 frame) |
| Cambio de canal cacheado | <50ms |
| Cambio de canal nunca-visto | <200ms P95 |
| `Cmd+K` palette abrir | <16ms |
| Reaction local | <16ms |

---

## Round-trip realtime

| Acción | Target |
| --- | --- |
| Mensaje a otros clientes | <150ms P50 / <400ms P95 |
| Reaction a otros clientes | <150ms P50 |
| Typing indicator a otros | <200ms |
| Edit/delete reflect | <150ms P50 |
| Search en canal | <100ms P95 |

---

## Cold start

| Métrica | Target |
| --- | --- |
| FCP | <1.0s en 4G |
| TTI | <2.0s en 4G |
| App-shell visible | <800ms |
| Mensajes último canal | <1.5s post-shell |
| WebSocket suscripto | <500ms post-auth |

---

## Reconexión

| Métrica | Target |
| --- | --- |
| Detectar pérdida WS | <3s |
| Mostrar "Reconectando…" | después de 2s persistente |
| Reconectar | <1s post-detección |
| Catch-up | <500ms P95 |

---

## Gates por fase

- **Pre-launch (Anillo 1):** alertas en cada PR, **no bloqueantes**.
- **Post-launch:** **bloqueantes** para 4 flujos críticos:
  - send→paint local <16ms
  - cambio canal cacheado <50ms
  - LCP shell <1.5s
  - CLS <0.1

---

## Métricas

- `evlog` para trazas server (con `traceId`).
- `web-vitals` (ya en deps) para LCP / INP / CLS / FCP / TTFB.
- **RUM custom events → Anillo 2.**
