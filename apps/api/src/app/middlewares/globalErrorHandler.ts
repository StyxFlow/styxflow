import type { NextFunction, Request, Response } from "express";

import httpStatus from "http-status";
import { ZodError } from "zod";

import { ApiError } from "../errors/apiError.js";
import type { ICustomError } from "../../interface/index.js";
import { zodErrorHandler } from "../errors/zodErrorHandler.js";

const globalErrorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode: number = httpStatus.INTERNAL_SERVER_ERROR;
  const success: boolean = false;
  let message: string = err.message || "Something went wrong";
  let error: Error | string | ICustomError[] | ICustomError = err;
  if (err instanceof ZodError) {
    const {
      message: errMessage,
      error: zodErr,
      statusCode: zodStatusCode,
    } = zodErrorHandler(err);
    message = errMessage;
    error = zodErr;
    statusCode = zodStatusCode;
  } else if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    error = {
      message: err.message,
      path: err?.stack || "No stack trace available",
    };
  }

  res.status(statusCode).json({
    statusCode,
    success,
    message,
    error,
  });
};

export default globalErrorHandler;
