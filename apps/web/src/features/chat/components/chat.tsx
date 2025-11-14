import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "@/lib/auth-client";
import { client } from "@meteor/api";
import { useQuery } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { useWebsockets } from "../hook/use-websockets";
import { MessageList } from "./message-list";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserPanel } from "./user-panel";
import { Spinner } from "@/components/ui/spinner";

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
  const { data, isPending } = useSession();

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
    <>
      {isPending ? (
        <Spinner />
      ) : (
        <div className="grid h-dvh w-full grid-cols-6 grid-rows-6 gap-4 p-2">
          <UserPanel session={data} />
          <Card className="col-span-5 col-start-2 row-span-6 row-start-1">
            <CardHeader>
              <CardTitle>Charla Global</CardTitle>
              <CardDescription>Canal para hablar globalmente</CardDescription>
            </CardHeader>
            <CardContent className="h-full">
              <MessageList messages={query.data} />
            </CardContent>
            <CardFooter>
              <form onSubmit={handleSend} className="flex w-full gap-6">
                <Input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Escribe tu mensaje..."
                />
                <Button type="submit">Enviar</Button>
              </form>
            </CardFooter>
          </Card>
        </div>
      )}
    </>
  );
}
