import { LoginForm } from "@/features/auth/components/login-form";
import { forUnAuthUsers } from "@/lib/auth-guard";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(auth)/login")({
  component: RouteComponent,
  beforeLoad: forUnAuthUsers,
});

function RouteComponent() {
  return <LoginForm />;
}
