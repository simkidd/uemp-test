export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errorCode?: string;

  constructor(message: string, statusCode = 400, errorCode?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    if (errorCode !== undefined) this.errorCode = errorCode;
    Error.captureStackTrace(this, this.constructor);
  }
}
