# STORAGE

Object storage (uploads) y email transaccional.

---

## Files / Object storage

- **Producción:** Cloudflare R2 (S3-compatible).
- **Desarrollo:** MinIO en `docker-compose.yml`. Idéntico a R2 vía mismo SDK `@aws-sdk/client-s3`, solo cambia endpoint.
- Abstracción `Storage` con métodos: `getUploadUrl`, `getPublicUrl`, `delete`.
- **Presigned uploads:** cliente sube directo a storage; el server **nunca** toca los bytes.

### Límites

| Tipo | Límite |
| --- | --- |
| Avatares | 2 MB |
| Attachments | 25 MB |

Se aplica whitelist de mime types.

### Diferido a Anillo 2

- Procesamiento (thumbnails).
- Signed URLs para canales privados.

---

## Email

- **Producción:** Resend.
- **Desarrollo:** Mailpit en `docker-compose.yml`.
- Abstracción `Mailer` con `send(to, subject, html)`.

---

## Tabla relacionada

`attachment` — metadatos de archivos subidos asociados a mensajes.
