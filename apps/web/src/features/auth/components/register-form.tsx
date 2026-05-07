import { Button } from "@meteor/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@meteor/ui/components/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@meteor/ui/components/field";
import { Input } from "@meteor/ui/components/input";
import { useForm } from "@tanstack/react-form";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { type RegisterInput, RegisterSchema } from "../schemas/register";

const DEFAULT_VALUES: RegisterInput = {
  email: "",
  password: "",
  confirmPassword: "",
};

export function RegisterForm() {
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: DEFAULT_VALUES,
    validators: { onSubmit: RegisterSchema },
    onSubmit: async ({ value }) => {
      const { error } = await authClient.signUp.email({
        email: value.email,
        password: value.password,
        // ADR-0007: el form no pide "name"; se pasa el email como placeholder
        // write-only para satisfacer el requirement de Better-Auth.
        name: value.email,
      });
      if (error) {
        toast.error("No se pudo crear la cuenta");
        return;
      }
      navigate({ to: "/" });
    },
  });

  return (
    <form
      className="flex min-h-screen items-center justify-center px-4 py-8"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        form.handleSubmit();
      }}
    >
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Crear cuenta</CardTitle>
          <CardDescription>
            Ingresa tu correo y contraseña para registrarte en Meteor.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-3">
          <FieldGroup>
            <form.Field name="email">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field
                    className="flex flex-col gap-1.5"
                    data-invalid={isInvalid}
                  >
                    <FieldLabel htmlFor={field.name}>
                      Correo electrónico
                    </FieldLabel>
                    <Input
                      type="email"
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      aria-invalid={isInvalid}
                      autoComplete="email"
                      placeholder="Correo electrónico"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="password">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field
                    className="flex flex-col gap-1.5"
                    data-invalid={isInvalid}
                  >
                    <FieldLabel htmlFor={field.name}>Contraseña</FieldLabel>
                    <Input
                      type="password"
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      aria-invalid={isInvalid}
                      autoComplete="new-password"
                      placeholder="Contraseña"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="confirmPassword">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field
                    className="flex flex-col gap-1.5"
                    data-invalid={isInvalid}
                  >
                    <FieldLabel htmlFor={field.name}>
                      Confirmar contraseña
                    </FieldLabel>
                    <Input
                      type="password"
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      aria-invalid={isInvalid}
                      autoComplete="new-password"
                      placeholder="Confirmar contraseña"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>
          </FieldGroup>
        </CardContent>

        <CardFooter className="flex flex-col items-stretch gap-3">
          <form.Subscribe
            selector={(state) => ({
              canSubmit: state.canSubmit,
              isSubmitting: state.isSubmitting,
            })}
          >
            {({ canSubmit, isSubmitting }) => (
              <Button type="submit" disabled={!canSubmit || isSubmitting}>
                {isSubmitting ? "Procesando…" : "Crear cuenta"}
              </Button>
            )}
          </form.Subscribe>
          <p className="text-center text-muted-foreground text-xs">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Inicia sesión
            </Link>
          </p>
        </CardFooter>
      </Card>
    </form>
  );
}
