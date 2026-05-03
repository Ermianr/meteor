import { z } from "zod";

export const LoginSchema = z.object({
  email: z.email("Correo inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
});

export type LoginInput = z.infer<typeof LoginSchema>;
