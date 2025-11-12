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
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { signIn } from "@/lib/auth-client";
import { useForm } from "@tanstack/react-form";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";

export function LoginForm() {
  const navigate = useNavigate();
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmit: z.object({
        email: z.email("El email debe tener un formato valido."),
        password: z
          .string()
          .min(8, "La contraseña debe tener como mínimo 8 caracteres."),
      }),
    },
    onSubmit: async ({ value: { email, password } }) => {
      await signIn.email(
        {
          email,
          password,
        },
        {
          onSuccess: () => {
            navigate({
              to: "/",
            });
            toast.success("Haz ingresado exitosamente.");
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
        <CardTitle>Iniciar Sesión</CardTitle>
        <CardDescription>Ingresa y chatea un rato</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="login-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
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
                      placeholder="Ingrese su contraseña"
                      autoComplete="current-password"
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
                form="login-form"
                disabled={!state.canSubmit || state.isSubmitting}
              >
                {state.isSubmitting ? "Iniciando Sesión..." : "Iniciar Sesión"}
              </Button>
            )}
          </form.Subscribe>
        </form>
      </CardContent>
      <CardFooter>
        <p>
          ¿No tienes una cuenta? <Link to="/register">Crear cuenta</Link>
        </p>
      </CardFooter>
    </Card>
  );
}
