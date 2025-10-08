import { Request, Response } from 'express';
import { AuthUseCase } from '@/application/usecases';
import { UserCreateDTO, UserLoginDTO, UserReadDTO, TokenResponse } from '../../application/DTOS/auth.dto';
import { ValidationError } from '@/domain/error/AppError';

export class AuthController {
  constructor(private UC_auth: AuthUseCase) { }

  async register(req: Request, res: Response): Promise<void> {

    const userRegisterDto: UserCreateDTO = req.body;
    const [user, accessToken] = await this.UC_auth.registerUser(userRegisterDto);

    if (!user.id) throw new ValidationError("No user id")
    const { createdAt, lastLoginAt, updatedAt, hashedPassword, ...rest } = user
    const userResponse: UserReadDTO = {
      ...rest,
      id: user.id,
      createdAt: createdAt!.toISOString(),
      lastLoginAt: lastLoginAt ? lastLoginAt.toISOString() : null,
      updatedAt: updatedAt ? updatedAt.toISOString() : null
    };

    const tokenResponse: TokenResponse = {
      accessToken,
      tokenType: "bearer",
      expiresIn: 1800,
      user: userResponse,
      isAdmin: user.isAdmin
    };

    res.success(tokenResponse, "Utilisateur inscrit avec succès");
  }

  async login(req: Request, res: Response): Promise<void> {
    const userLoginDto: UserLoginDTO = req.body;
    const [user, accessToken] = await this.UC_auth.loginUser(userLoginDto);

    if (!user.id) throw new ValidationError("User id is missing");

    const { createdAt, lastLoginAt, updatedAt, hashedPassword, ...rest } = user
    const userResponse: UserReadDTO = {
      ...rest,
      id: user.id,
      createdAt: createdAt!.toISOString(),
      lastLoginAt: lastLoginAt ? lastLoginAt.toISOString() : null,
      updatedAt: updatedAt ? updatedAt.toISOString() : null
    };

    const tokenResponse: TokenResponse = {
      accessToken,
      tokenType: "bearer",
      expiresIn: 1800,
      user: userResponse,
      isAdmin: user.isAdmin
    };

    res.success(tokenResponse, "Connexion réussie");
  }
}