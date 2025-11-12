import type { Message } from "@meteor/api";
import { client } from "@meteor/api";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { publishActions, type DataToSend } from "@meteor/shared/types";

export function useWebsockets() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const websocket = client.api.ws.$ws();

    websocket.addEventListener("open", () => {
      console.log("Conectado");
    });

    websocket.addEventListener("message", (e) => {
      try {
        const data: DataToSend = JSON.parse(e.data.toString());
        switch (data.action) {
          case publishActions.UPDATE_CHAT:
            queryClient.setQueryData(["messages"], (old: Message[] = []) => [
              ...old,
              data.message,
            ]);
        }
      } catch (_) {}
    });

    return () => {
      websocket.close();
    };
  }, [queryClient]);
}
