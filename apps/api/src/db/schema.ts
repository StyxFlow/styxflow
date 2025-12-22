import { relations, sql } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  boolean,
  pgEnum,
  uuid,
  integer,
  json,
  check,
} from "drizzle-orm/pg-core";

export const UserRole = pgEnum("user_role", ["CANDIDATE", "RECRUITER"]);
export const JobType = pgEnum("job_type", [
  "FULL_TIME",
  "PART_TIME",
  "CONTRACT",
  "INTERNSHIP",
]);

export const question = pgTable("question", {
  id: uuid("id").primaryKey().defaultRandom(),
  interviewId: uuid("interview_id")
    .notNull()
    .references(() => interview.id),
  questionText: text("question_text").notNull(),
  answerText: text("answer_text"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const interview = pgTable(
  "interview",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    candidateId: uuid("candidate_id")
      .references(() => candidate.id)
      .notNull(),
    score: integer("score"),
    feedback: text("feedback"),
    attempt: integer("attempt").default(1).notNull(),
    isCompleted: boolean("is_completed").default(false).notNull(),
    recordingUrl: text("recording_url"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    check("age_check1", sql`${table.score} >=0 AND ${table.score} <=100`),
  ]
);

export const job = pgTable("job", {
  id: uuid("id").primaryKey().defaultRandom(),
  jobRole: text("job_role").notNull(),
  jobDescription: text("job_description").notNull(),
  jobType: JobType("job_type").notNull(),
  location: text("location").notNull(),
  technologies: text("technologies").array().default([]).notNull(),
  additionalSkills: text("additional_skills").array().default([]).notNull(),
  education: text("education"),
  experience: integer("experience"),
  salaryRange: json("salary_range").$type<{ min: number; max: number }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  recruiterId: uuid("recruiter_id")
    .references(() => recruiter.id, {
      onDelete: "cascade",
    })
    .notNull(),
});

export const candidate = pgTable("candidate", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
export const recruiter = pgTable("recruiter", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  organizationName: text("organization_name").notNull(),
  organizationRole: text("organization_role"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  image: text("image"),
  emailVerified: boolean("email_verified").default(false).notNull(),
  role: UserRole("role"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Relations ---------------------

export const recruiterRelations = relations(recruiter, ({ one, many }) => ({
  user: one(user, {
    fields: [recruiter.userId],
    references: [user.id],
  }),
  jobs: many(job), // One recruiter has many jobs
}));

export const jobRelations = relations(job, ({ one }) => ({
  recruiter: one(recruiter, {
    fields: [job.recruiterId],
    references: [recruiter.id],
  }),
}));

export const userRelations = relations(user, ({ one }) => ({
  recruiter: one(recruiter, {
    fields: [user.id],
    references: [recruiter.userId],
  }),
}));

export const candidateRelations = relations(candidate, ({ one, many }) => {
  return {
    user: one(user, {
      fields: [candidate.userId],
      references: [user.id],
    }),
    interview: many(interview),
  };
});

export const interviewRelations = relations(interview, ({ one, many }) => {
  return {
    candidate: one(candidate, {
      fields: [interview.candidateId],
      references: [candidate.id],
    }),
    question: many(question),
  };
});

export const questionRelations = relations(question, ({ one }) => {
  return {
    interview: one(interview, {
      fields: [question.interviewId],
      references: [interview.id],
    }),
  };
});
