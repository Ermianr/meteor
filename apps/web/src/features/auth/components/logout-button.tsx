import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth-client";
import { useNavigate } from "@tanstack/react-router";

export function LogOutButton() {
  const navigate = useNavigate();
  return (
    <Button
      onClick={() => {
        signOut();
        navigate({
          to: "/login",
        });
      }}
    >
      Cerrar Sesión
    </Button>
  );
}
