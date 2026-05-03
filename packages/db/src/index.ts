import { drizzle } from "drizzle-orm/node-postgres";

import * as schema from "./schema";

export function createDb() {
	return drizzle(process.env.DATABASE_URL || "", { schema });
}

export const db = createDb();
