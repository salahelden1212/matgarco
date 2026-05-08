import { Request, Response, NextFunction } from 'express';

// Custom error class with enhanced details
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  code?: string;
  errors?: string[];

  constructor(message: string, statusCode: number, details?: { code?: string; errors?: string[] }) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = details?.code;
    this.errors = details?.errors;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Error handler middleware
export const errorHandler = (
  err: AppError | Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let code: string | undefined;
  let errors: string[] | undefined;
  let isOperational = false;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    code = err.code;
    errors = err.errors;
    isOperational = err.isOperational;
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    code = 'VALIDATION_ERROR';
    // Extract validation errors from mongoose
    if ((err as any).errors) {
      errors = Object.values((err as any).errors).map((e: any) => e.message);
    }
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
    code = 'INVALID_ID_FORMAT';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    code = 'INVALID_TOKEN';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
    code = 'TOKEN_EXPIRED';
  }

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error:', {
      message: err.message,
      code,
      errors,
      stack: err.stack,
      statusCode,
    });
  }

  // Send consistent error response
  const errorResponse: any = {
    success: false,
    error: {
      message,
      code,
      ...(errors && { errors }),
    },
  };

  // Add development details
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = err.stack;
    errorResponse.error.details = err.message;
  }

  res.status(statusCode).json(errorResponse);
};

// Async handler wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
