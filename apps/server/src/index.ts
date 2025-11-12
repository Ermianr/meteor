import "dotenv/config";
import { Hono } from "hono";
import { logger } from "hono/logger";
import authRoute from "./routes/auth";
import messagesRoute from "./routes/messages";
import websocketsRoute from "./routes/websockets";
import { cors } from "hono/cors";
import { auth } from "@meteor/auth";
import { websocket } from "hono/bun";

declare module "hono" {
  interface ContextVariableMap {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  }
}

const app = new Hono()
  .use(logger())
  .use(
    "/*",
    cors({
      origin: process.env.CORS_ORIGIN || "",
      allowMethods: ["POST", "GET", "OPTIONS"],
      allowHeaders: ["Content-Type", "Authorization"],
      exposeHeaders: ["Content-Length"],
      maxAge: 600,
      credentials: true,
    })
  )
  .use("*", async (c, next) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session) {
      c.set("user", null);
      c.set("session", null);
      await next();
      return;
    }
    c.set("user", session.user);
    c.set("session", session.session);
    await next();
  })
  .basePath("/api")
  .route("/auth", authRoute)
  .route("/ws", websocketsRoute)
  .route("/messages", messagesRoute);

export const server = Bun.serve({
  fetch: app.fetch,
  websocket,
});

export type AppType = typeof app;

export default app;
