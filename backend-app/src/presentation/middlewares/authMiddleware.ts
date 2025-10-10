import { Request, Response, NextFunction } from 'express';
import { JWTService } from '@/application/services/jwt.service';
import { InvalidCredentialsError } from '@/domain/error/AppError';

const jwtService = new JWTService();

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Token manquant ou invalide' });
  }

  const token = authHeader.split(' ')[1];
  const user = jwtService.getUserFromToken(token);
  if (!user) {
    return res.status(401).json({ success: false, error: 'Token invalide ou expiré' });
  }

  (req as any).user = user;
  next();
};