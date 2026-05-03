import { z } from "zod";

export const RegisterSchema = z
  .object({
    username: z
      .string()
      .min(3, "Mínimo 3 caracteres")
      .max(32, "Máximo 32 caracteres"),
    email: z.email("Correo inválido"),
    birthdate: z
      .string()
      .min(1, "Selecciona una fecha")
      .refine((value) => !Number.isNaN(Date.parse(value)), "Fecha inválida"),
    password: z.string().min(8, "Mínimo 8 caracteres"),
    confirmPassword: z.string().min(1, "Confirma tu contraseña"),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Las contraseñas no coinciden",
  });

export type RegisterInput = z.infer<typeof RegisterSchema>;
