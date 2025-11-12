import { db } from "../../../db/drizzle.js";
import { candidate, recruiter } from "../../../db/schema.js";

const confirmUserRole = async (payload: {
  userId: string;
  role: string;
  organizationName?: string;
  organizationRole?: string;
}) => {
  //   if (payload.role === "CANDIDATE") {
  //     const result = await db.insert(candidate).values({
  //       userId: payload.userId,
  //       id: crypto.randomUUID(),
  //     });
  //     return result;
  //   } else if (payload.role === "RECRUITER") {
  //     const result = await db.insert(recruiter).values({
  //       userId: payload.userId,
  //       id: crypto.randomUUID(),
  //       organizationName: payload.organizationName!,
  //       organizationRole: payload.organizationRole,
  //     });
  //     return result;
  //   }
};

export const UserService = {
  confirmUserRole,
};
