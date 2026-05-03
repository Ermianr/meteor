import { createFileRoute } from "@tanstack/react-router";

import { LoginForm } from "@/features/auth";

export const Route = createFileRoute("/login")({
  component: LoginRoute,
});

function LoginRoute() {
  return <LoginForm />;
}
