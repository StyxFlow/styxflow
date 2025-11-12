import type { Response } from "express";

type TResponseData<T> = {
  statusCode: number;
  message: string;
  success: boolean;
  data?: T | null | undefined;
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
};

export const sendResponse = <T>(res: Response, jsonData: TResponseData<T>) => {
  const { statusCode, message, data, meta, success } = jsonData;
  res.status(statusCode).json({
    statusCode,
    success,
    message,
    data,
    meta,
  });
};
