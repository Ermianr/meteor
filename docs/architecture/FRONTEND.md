# FRONTEND

Arquitectura del cliente: TanStack Start + TanStack Router + TanStack Query + shadcn/ui.

App vive en `apps/web/`.

---

## Estructura de rutas (TanStack Router)

```
/                              → home
/login, /signup                → auth
/invite/:code                  → aceptar invitación
/channels/@me                  → lista de DMs
/channels/@me/:dmId            → DM específico
/channels/:serverId            → server (auto-redirect a primer canal)
/channels/:serverId/:channelId → canal específico
/settings, /settings/server/:id → config
```

---

## Layouts

- `__root.tsx` → providers (Query, Auth, WS).
- `_public.tsx` → rutas sin auth.
- `_app.tsx` → shell con auth.
- `_app/channels/_channels.tsx` → layout principal: sidebar de servers + canales/DMs + slot mensajes + sidebar miembros.

**Solo el slot central re-renderiza** al navegar entre canales. WS persiste, presencia persiste, scroll persiste.

---

## WebSocket en cliente

- **Singleton fuera de React** en `apps/web/src/lib/ws/client.ts`.
- Conectado en `_app.tsx` con `<WSProvider>` que monta/desmonta según auth.
- Componentes se subscriben a eventos específicos.
- **No se usa Context para datos del WS.**

---

## Estado

- **TanStack Query es la única fuente para datos del server.**
- WebSocket actualiza la cache: `queryClient.setQueryData(...)` por evento.
- Optimistic UI con `useMutation.onMutate` + `clientNonce`.
- UI local efímera (drawers, modals, theme): `useState` o Zustand minimalista.

---

## Loading states

Sin spinners de página completa. **Skeleton screens** del tamaño exacto del contenido final. Cero CLS.

---

## Targets ligados al frontend

Ver [PERFORMANCE.md](./PERFORMANCE.md) — todos los targets de "acciones locales" y "cold start" recaen aquí.
