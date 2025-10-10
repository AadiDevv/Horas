import { Request, Response, NextFunction } from 'express';
import { JWTService } from '@/application/services/jwt.service';

const jwtService = new JWTService();

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // #region - Extraction du token
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Token manquant ou invalide' });
    return;
  }
  // #endregion

  // #region - Validation du token
  const token = authHeader.split(' ')[1];
  const user = jwtService.getUserFromToken(token);
  if (!user) {
    res.status(401).json({ success: false, error: 'Token invalide ou expiré' });
    return;
  }
  // #endregion

  // #region - Attachement de l'utilisateur à la requête
  req.user = user;
  next();
  // #endregion
};