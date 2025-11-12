import { hc } from "hono/client";
import type { InferResponseType } from "hono/client";
import type { AppType } from "server";

export const client = hc<AppType>("http://localhost:3000/");
export type Message = InferResponseType<
  typeof client.api.messages.$get
>[number];
