import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { User } from '@/domain/entities/user';
import { UserAuthDTO } from '../DTOS/auth.dto';
/**
 * Service pour la gestion des tokens JWT et du hachage de mots de passe
 */
export class JWTService {
  private readonly secretKey: string;
  private readonly algorithm: jwt.Algorithm = 'HS256';
  private readonly accessTokenExpireMinutes: number;

  constructor() {
    this.secretKey = process.env.JWT_SECRET_KEY || 'your-secret-key-change-in-production';
    this.accessTokenExpireMinutes = parseInt(process.env.JWT_EXPIRE_MINUTES || '30');
  }

  /**
   * Génère un token JWT d'accès
   */
  public createAccessToken(user: User, expiresDelta?: number): string {
    const payload = user.toJwtPayload() as UserAuthDTO;

    const expire = expiresDelta
      ? new Date(Date.now() + expiresDelta * 60 * 1000) // minutes to milliseconds
      : new Date(Date.now() + this.accessTokenExpireMinutes * 60 * 1000);

    const toEncode = {
      ...payload,
      exp: Math.floor(expire.getTime() / 1000), // Convert to seconds
      iat: Math.floor(Date.now() / 1000),
      type: 'access'
    };

    return jwt.sign(toEncode, this.secretKey, { algorithm: this.algorithm as jwt.Algorithm });
  }

  public verifyToken(token: string): any | null {
    try {
      const payload = jwt.verify(token, this.secretKey, { algorithms: [this.algorithm as jwt.Algorithm] }) as any;

      // Vérifier le type de token
      if (payload.type !== 'access') {
        return null;
      }

      return payload;
    } catch (error) {
      return null;
    }
  }

  public getUserFromToken(token: string): any | null {
    const payload = this.verifyToken(token);
    if (!payload) {
      return null;
    }

    const userId = payload.sub;
    if (!userId) {
      return null;
    }

    return {
      id: userId,
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      role: payload.role || 'employe',
      isActive: payload.isActive || false,
      lastLoginAt: payload.lastLoginAt
    };
  }
  public static hashedPassword(password: string): string {
    const saltRounds = 10;
    return bcrypt.hashSync(password, saltRounds);
  }

  public async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
