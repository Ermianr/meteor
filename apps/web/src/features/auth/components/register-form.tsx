import { Button, buttonVariants } from "@meteor/ui/components/button";
import { Calendar } from "@meteor/ui/components/calendar";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@meteor/ui/components/popover";
import { es } from "@meteor/ui/lib/calendar-locales";
import { cn } from "@meteor/ui/lib/utils";
import { useForm } from "@tanstack/react-form";
import { Link } from "@tanstack/react-router";
import { CalendarIcon } from "lucide-react";

import { type RegisterInput, RegisterSchema } from "../schemas/register";

const displayDateFormatter = new Intl.DateTimeFormat("es", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

function parseLocalDate(value: string): Date | undefined {
  const parts = value.split("-").map(Number);
  if (parts.length !== 3 || parts.some((part) => Number.isNaN(part))) {
    return undefined;
  }
  const [year, month, day] = parts;
  return new Date(year, month - 1, day);
}

function toLocalDateString(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const DEFAULT_VALUES: RegisterInput = {
  username: "",
  email: "",
  birthdate: "",
  password: "",
  confirmPassword: "",
};

export function RegisterForm() {
  const form = useForm({
    defaultValues: DEFAULT_VALUES,
    validators: { onSubmit: RegisterSchema },
    onSubmit: async () => {
      // TODO(auth wiring): reemplazar por authClient.signUp.email
      await new Promise((resolve) => setTimeout(resolve, 800));
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
            Completa tus datos para registrarte en Meteor.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-3">
          <FieldGroup>
            <form.Field name="username">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field
                    className="flex flex-col gap-1.5"
                    data-invalid={isInvalid}
                  >
                    <FieldLabel htmlFor={field.name}>
                      Nombre de usuario
                    </FieldLabel>
                    <Input
                      type="text"
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      aria-invalid={isInvalid}
                      autoComplete="username"
                      placeholder="Nombre de usuario"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>

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

            <form.Field name="birthdate">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                const selectedDate = field.state.value
                  ? parseLocalDate(field.state.value)
                  : undefined;

                return (
                  <Field
                    className="flex flex-col gap-1.5"
                    data-invalid={isInvalid}
                  >
                    <FieldLabel htmlFor={field.name}>
                      Fecha de nacimiento
                    </FieldLabel>
                    <Popover>
                      <PopoverTrigger
                        id={field.name}
                        name={field.name}
                        onBlur={field.handleBlur}
                        aria-invalid={isInvalid}
                        className={cn(
                          buttonVariants({ variant: "outline" }),
                          "w-full justify-between font-normal",
                          !selectedDate && "text-muted-foreground",
                        )}
                      >
                        {selectedDate
                          ? displayDateFormatter.format(selectedDate)
                          : "Selecciona una fecha"}
                        <CalendarIcon className="size-4 opacity-50" />
                      </PopoverTrigger>
                      <PopoverContent align="start" className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => {
                            field.handleChange(
                              date ? toLocalDateString(date) : "",
                            );
                            field.handleBlur();
                          }}
                          captionLayout="dropdown"
                          defaultMonth={selectedDate ?? new Date(2000, 0, 1)}
                          startMonth={new Date(1900, 0, 1)}
                          endMonth={new Date()}
                          disabled={{ after: new Date() }}
                          locale={es}
                          autoFocus
                        />
                      </PopoverContent>
                    </Popover>
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
