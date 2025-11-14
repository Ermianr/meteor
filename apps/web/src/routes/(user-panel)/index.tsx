import { Chat } from "@/features/chat/components/chat";
import { forAuthUsers } from "@/lib/auth-guard";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(user-panel)/")({
  component: RouteComponent,
  beforeLoad: forAuthUsers,
});

function RouteComponent() {
  return <Chat />;
}
