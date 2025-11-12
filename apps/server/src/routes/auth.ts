import { auth } from "@meteor/auth";
import { Hono } from "hono";

const authRoute = new Hono().on(["POST", "GET"], "/*", (c) => {
  return auth.handler(c.req.raw);
});

export default authRoute;
