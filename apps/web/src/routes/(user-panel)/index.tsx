import { LogOutButton } from "@/features/auth/components/logout-button";
import { Chat } from "@/features/chat/components/chat";
import { useSession } from "@/lib/auth-client";
import { forAuthUsers } from "@/lib/auth-guard";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(user-panel)/")({
  component: RouteComponent,
  beforeLoad: forAuthUsers,
});

function RouteComponent() {
  const { data } = useSession();
  return (
    <div>
      Hola! {data?.user.name} <LogOutButton />
      <Chat />
    </div>
  );
}
