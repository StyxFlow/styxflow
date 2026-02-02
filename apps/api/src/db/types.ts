import type { InferSelectModel } from "drizzle-orm";
import type { interview, job, question, session, user } from "./schema.js";

export type IJob = InferSelectModel<typeof job>;
export type IUser = InferSelectModel<typeof user>;
export type ISession = InferSelectModel<typeof session>;
export type IInterview = InferSelectModel<typeof interview>;
export type IQuestion = InferSelectModel<typeof question>;
