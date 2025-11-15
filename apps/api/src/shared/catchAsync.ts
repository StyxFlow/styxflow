import type { NextFunction, RequestHandler, Response } from "express";
import type { ICustomRequest } from "../interface/index.js";

export const catchAsync = (fn: RequestHandler) => {
  return async (req: ICustomRequest, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      next(error);
    });
  };
};
