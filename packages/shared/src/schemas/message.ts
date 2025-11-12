import { z } from "zod";

export const MessageSchema = z.object({
  userId: z.string(),
  username: z.string(),
  text: z.string().max(150, "Solo se admite un máximo de 150 caracteres."),
});
