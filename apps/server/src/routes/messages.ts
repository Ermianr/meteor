import { zValidator } from "@hono/zod-validator";
import { db } from "@meteor/db";
import { user } from "@meteor/db/schema/auth";
import { message } from "@meteor/db/schema/message";
import { MessageSchema } from "@meteor/shared/schemas";
import { publishActions } from "@meteor/shared/types";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { nanoid } from "nanoid";
import { server } from "../index";

const messagesRoute = new Hono()
  .get("/", async (c) => {
    const allMessages = await db
      .select({
        id: message.id,
        text: message.text,
        userId: message.userId,
        createdAt: message.createdAt,
        username: user.name,
      })
      .from(message)
      .innerJoin(user, eq(message.userId, user.id))
      .orderBy(message.createdAt);

    return c.json(allMessages);
  })
  .post(
    "/",
    zValidator("json", MessageSchema, (result, c) => {
      if (!result.success) {
        return c.json({ success: false }, 400);
      }
    }),
    async (c) => {
      const param = c.req.valid("json");
      const [inserted] = await db
        .insert(message)
        .values({
          id: nanoid(),
          text: param.text,
          userId: param.userId,
        })
        .returning();

      const data = {
        action: publishActions.UPDATE_CHAT,
        message: { ...inserted, username: param.username },
      };

      server.publish("meteor", JSON.stringify(data));

      return c.json({ success: true });
    }
  );

export default messagesRoute;
