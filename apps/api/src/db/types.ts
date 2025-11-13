import type { InferSelectModel } from "drizzle-orm";
import type { job, session, user } from "./schema.js";

export type IJob = InferSelectModel<typeof job>;
export type IUser = InferSelectModel<typeof user>;
export type ISession = InferSelectModel<typeof session>;
