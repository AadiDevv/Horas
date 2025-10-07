import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error(err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'development' 
    ? err.message 
    : 'Internal server error';

  res.status(statusCode).json({ 
    error: 'Something went wrong!',
    message
  });
};

export const notFoundHandler = (
  req: Request,
  res: Response
): void => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl 
  });
};
