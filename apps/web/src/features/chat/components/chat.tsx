import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "@/lib/auth-client";
import { client } from "@meteor/api";
import { useQuery } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { useWebsockets } from "../hook/use-websockets";
import { MessageList } from "./message-list";

export function Chat() {
  useWebsockets();
  const query = useQuery({
    queryKey: ["messages"],
    queryFn: async () => {
      const res = await client.api.messages.$get();
      return await res.json();
    },
  });
  const [text, setText] = useState("");
  const { data } = useSession();
  const handleSend = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!data) {
      throw new Error("Usuario no autorizado.");
    }

    try {
      const response = await client.api.messages.$post({
        json: {
          userId: data.user.id,
          text: text,
          username: data.user.name,
        },
      });

      if (!response.ok) {
        throw new Error("Ocurrió un fallo al enviar el mensaje.");
      }
    } catch (error) {
      toast.error(`Ha ocurrido un error ${error}`);
    } finally {
      setText("");
    }
  };

  return (
    <div>
      <MessageList messages={query.data} />
      <form onSubmit={handleSend}>
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe tu mensaje..."
        />
        <Button type="submit">Enviar</Button>
      </form>
    </div>
  );
}
