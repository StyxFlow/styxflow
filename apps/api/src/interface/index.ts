import type { Request } from "express";

export interface ICustomError {
  message: string;
  path: string;
}

export interface ICustomRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  session?: {
    id: string;
    userId: string;
    expiresAt: Date;
  };
}
