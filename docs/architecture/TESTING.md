# TESTING

Estrategia de pruebas. Testing Trophy.

---

## Distribución

| Tipo | % esfuerzo | Tooling |
| --- | --- | --- |
| Unit | 30% | `bun test` |
| **Integration** | **50%** | `bun test` + Postgres efímera |
| Component | (parte de unit) | Vitest + Testing Library |
| E2E | 15% | Playwright |
| Manual exploratorio | 5% | — |

El centro de gravedad está en **integration**.

---

## WebSocket tests específicos (críticos)

- Cross-client message delivery.
- Catch-up al reconectar (`sinceSeq` recupera mensajes perdidos).
- Idempotencia con `clientNonce` duplicado.
- Permisos (no-member rechazado).

---

## Coverage

**Sin target de %.** Cada flow crítico cubierto, cada bug-fix con su test de regresión.

---

## E2E — 4 flujos imprescindibles (nightly)

1. Signup → verify email → login.
2. Crear server → canal → invitar → joinear → chatear.
3. DM con optimistic + edit + delete + reaction.
4. Reconnect: kill WS → catch-up funciona.

---

## Cuándo escribir tests

- **TDD** para lógica de permisos, parsers, idempotencia.
- **Post-código** para UI (refactor frecuente).
- **Bug fixes:** test de regresión **antes** del fix.
