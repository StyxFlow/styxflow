import type { Request, Response, NextFunction } from "express";
import { auth } from "../../lib/auth.js";
import type { ICustomRequest } from "../../interface/index.js";
import { ApiError } from "../errors/apiError.js";
import config from "../../config/index.js";

export type TUserRole = "CANDIDATE" | "RECRUITER";

export const validateUser = (...roles: TUserRole[]) => {
  return async (req: ICustomRequest, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization;
      console.log("token --> ", token);
      if (!token) {
        return res.status(401).json({
          success: false,
          message: "No session token provided",
        });
      }

      const modifiedHeaders = {
        ...req.headers,
        cookie: `${config.better_token_key}=${token}`,
      };
      console.log(
        "modifiedHeaders --> ",
        `${config.better_token_key}=${token}`,
      );
      const session = await auth.api
        .getSession({
          headers: modifiedHeaders as any,
        })
        .catch((err) => {
          console.log("better_auth err --> ", err);
        });
      console.log("session --> ", session);
      if (!session?.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized - Please login",
        });
      }
      if (roles.length && !roles.includes(session.user.role)) {
        throw new ApiError(403, "You are not authorized!");
      }
      req.user = {
        ...session.user,
        image: session.user.image ?? null,
      };
      req.session = session.session;
      next();
    } catch (error) {
      next(error);
    }
  };
};
