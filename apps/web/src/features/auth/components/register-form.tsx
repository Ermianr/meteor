import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { signUp } from "@/lib/auth-client";
import { useForm } from "@tanstack/react-form";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";

export function RegisterForm() {
  const navigate = useNavigate();
  const form = useForm({
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validators: {
      onSubmit: z
        .object({
          username: z
            .string()
            .min(3, "El nombre de usuario debe tener como mínimo 3 caracteres.")
            .max(
              20,
              "El nombre de usuario debe tener como máximo 20 caracteres."
            ),
          email: z.email("El email debe tener un formato valido."),
          password: z
            .string()
            .min(8, "La contraseña debe tener como mínimo 8 caracteres."),
          confirmPassword: z.string(),
        })
        .refine((data) => data.password === data.confirmPassword, {
          error: "Las contraseñas deben coincidir.",
          path: ["confirmPassword"],
        }),
    },
    onSubmit: async ({ value: { username, email, password } }) => {
      await signUp.email(
        {
          name: username,
          email,
          password,
        },
        {
          onSuccess: () => {
            toast.success("Usuario registrado exitosamente.");
            navigate({
              to: "/login",
            });
          },
          onError: (error) => {
            console.log(error);
            toast.error(`Error: ${error.error}`);
          },
        }
      );
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Formulario de Registro</CardTitle>
        <CardDescription>
          Regístrate en la plataforma para poder ingresar
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="register-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            {/* Campo username */}

            <form.Field name="username">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      Nombre de usuario
                    </FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Elige un nombre de usuario"
                      autoComplete="username"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>
            {/* Campo email */}

            <form.Field name="email">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Ingresa tu correo electrónico"
                      autoComplete="email"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>
            {/* Campo password */}

            <form.Field name="password">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Contraseña</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Cree una contraseña"
                      autoComplete="new-password"
                      type="password"
                    />
                    <FieldDescription>
                      La contraseña debe contar con 8 caracteres como mínimo.
                    </FieldDescription>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>
            {/* Campo confirmPassword */}

            <form.Field name="confirmPassword">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      Confirmar contraseña
                    </FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Confirmar contraseña"
                      autoComplete="new-password"
                      type="password"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>
          </FieldGroup>
          <form.Subscribe>
            {(state) => (
              <Button
                type="submit"
                form="register-form"
                disabled={!state.canSubmit || state.isSubmitting}
              >
                {state.isSubmitting ? "Registrando Usuario..." : "Registrarse"}
              </Button>
            )}
          </form.Subscribe>
        </form>
      </CardContent>
      <CardFooter>
        <p>
          ¿Ya tienes una cuenta? <Link to="/login">Iniciar Sesión</Link>
        </p>
      </CardFooter>
    </Card>
  );
}
