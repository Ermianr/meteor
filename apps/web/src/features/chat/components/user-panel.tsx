import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { UserSession } from "@/lib/auth-client";
import { Settings } from "lucide-react";
import { toast } from "sonner";

export function UserPanel({ session }: { session: UserSession | null }) {
  if (!session) {
    toast.error("Usuario no autorizado.");
    return;
  }

  const { name } = session.user;
  return (
    <Card className="col-start-1 row-start-6 flex justify-center">
      <CardContent className="flex items-center gap-4 px-4">
        <Avatar className="size-10">
          <AvatarImage src="/" />
          <AvatarFallback>{name.charAt(0)}</AvatarFallback>
        </Avatar>
        <p className="font-medium">@{name}</p>
        <Button variant="ghost">
          <Settings />
        </Button>
      </CardContent>
    </Card>
  );
}
