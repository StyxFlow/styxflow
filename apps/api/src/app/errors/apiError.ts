export class ApiError extends Error {
  public statusCode: number;
  public stack?: string;
  constructor(statusCode: number, message: string, stack?: string) {
    super(message);
    this.statusCode = statusCode;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
