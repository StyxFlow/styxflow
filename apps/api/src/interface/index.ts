import type { Request } from "express";
import type { IUser } from "../db/types.js";

export interface ICustomError {
  message: string;
  path: string;
}

export interface ICustomRequest extends Request {
  user?: IUser;
  session?: {
    id: string;
    userId: string;
    expiresAt: Date;
  };
}
