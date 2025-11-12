import { RegisterForm } from "@/features/auth/components/register-form";
import { forUnAuthUsers } from "@/lib/auth-guard";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(auth)/register")({
  component: RouteComponent,
  beforeLoad: forUnAuthUsers,
});

function RouteComponent() {
  return <RegisterForm />;
}
