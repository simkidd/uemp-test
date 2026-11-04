import { Request, Response, NextFunction } from "express";
import { logger, sendError, AppError } from "../utils/index.js";
import { ENV } from "../config/env.js";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  logger.error(`${req.method} ${req.originalUrl}: ${err.message || err}`, {
    stack: err.stack,
  });

  // AppError (Operational expected error)
  if (err instanceof AppError || err.isOperational) {
    sendError(res, err.message, err.statusCode || 400, err.errorCode);
    return;
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    sendError(res, `A record with this ${field} already exists.`, 409);
    return;
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e: any) => e.message);
    sendError(res, "Validation Error", 400, messages);
    return;
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === "CastError") {
    sendError(res, `Invalid ID format: ${err.value}`, 400);
    return;
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  sendError(
    res,
    message,
    statusCode,
    !ENV.IS_PROD ? { stack: err.stack } : undefined,
  );
};

export const notFoundHandler = (req: Request, res: Response): void => {
  sendError(res, `Resource not found: ${req.method} ${req.originalUrl}`, 404);
};
