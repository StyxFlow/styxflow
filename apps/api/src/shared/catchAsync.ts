import type { NextFunction, Request, RequestHandler, Response } from "express";
// import { ICustomRequest } from '../interface';

export const catchAsync = (fn: RequestHandler) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      next(error);
    });
  };
};
