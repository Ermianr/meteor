import { Hono } from "hono";
import { upgradeWebSocket } from "hono/bun";

const websocketsRoute = new Hono().get(
  "/",
  upgradeWebSocket((_) => {
    return {
      onOpen(_, ws) {
        const raw = ws.raw;
        raw.subscribe("meteor");
        console.log("WebSocket server opened and subscribed to topic meteor");
      },
      onClose: (_, ws) => {
        const raw = ws.raw;
        raw.unsubscribe("meteor");
        console.log(
          "WebSocket server closed and unsubscribed from topic meteor"
        );
      },
    };
  })
);

export default websocketsRoute;
