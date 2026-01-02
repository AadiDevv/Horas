import { Request, Response, NextFunction } from 'express';
import { AppError } from '@/domain/error/AppError';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {

  // Si c'est une erreur métier (AppError)
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      error: error.message,
      code: error.errorCode,
      timestamp: new Date().toISOString()
    });
  }

  // Erreurs de validation (Joi, etc.)
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: error.message,
      code: 'VALIDATION_ERROR',
      timestamp: new Date().toISOString()
    });
  }

  // Erreurs JWT
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Token invalide',
      code: 'AUTH_ERROR',
      timestamp: new Date().toISOString()
    });
  }

  // Erreurs par défaut
  return res.status(500).json({
    success: false,
    error: 'Erreur serveur interne',
    code: 'SERVER_ERROR',
    timestamp: new Date().toISOString()
  });
};
