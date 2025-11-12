import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const message = pgTable("message", {
  id: text("id").primaryKey(),
  text: text("text").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
