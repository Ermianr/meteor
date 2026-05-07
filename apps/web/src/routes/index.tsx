import { Link, createFileRoute } from "@tanstack/react-router";

import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/")({
  component: HomeRoute,
});

function HomeRoute() {
  const { data, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <main className="flex min-h-screen items-center justify-center p-8">
        <p className="text-muted-foreground text-sm">Cargando…</p>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-2 p-8">
        <p>No has iniciado sesión.</p>
        <p className="text-sm">
          <Link to="/login" className="text-primary underline">
            Iniciar sesión
          </Link>
          {" · "}
          <Link to="/register" className="text-primary underline">
            Crear cuenta
          </Link>
        </p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <p>
        Sesión activa: <strong>{data.user.email}</strong>
      </p>
    </main>
  );
}
