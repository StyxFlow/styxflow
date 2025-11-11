import status from "http-status";
import { ZodError } from "zod";

export const zodErrorHandler = (err: ZodError) => {
  const statusCode = status.BAD_REQUEST;
  const error = err.issues.map((issue) => {
    return { message: issue.message, path: issue.path.join(".") };
  });
  const message = err.issues[0]?.message || "Zod validation error";
  return {
    statusCode,
    message,
    error,
  };
};
