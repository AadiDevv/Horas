import { Request, Response } from 'express';
import { AuthUseCase } from '@/application/usecases';
import { UserCreateDTO, UserLoginDTO, UserReadDTO, TokenResponse } from '../../application/DTOS/';
import { ValidationError } from '@/domain/error/AppError';
import { JWTService } from '@/application/services';

export class AuthController {
  constructor(private UC_auth: AuthUseCase) { }

  // Helper pour convertir les dates en ISO string

  private async _registerUser(dto: UserCreateDTO): Promise<UserReadDTO> {
    const user = await this.UC_auth.registerUser(dto);
    return user.toReadDTO();
  }

  async registerEmploye(req: Request, res: Response): Promise<void> {
    // #region - Validation
    const userRegisterDto: UserCreateDTO = req.body;
    if (userRegisterDto.role !== 'employe') throw new ValidationError("User role is not valid");
    // #endregion

    const userResponse = await this._registerUser(userRegisterDto);
    res.success(userResponse, "Utilisateur inscrit avec succès");
  }
  async registerManager(req: Request, res: Response): Promise<void> {
    // #region - Validation
    const userRegisterDto: UserCreateDTO = req.body;
    if (userRegisterDto.role !== 'manager') throw new ValidationError("User role is not valid");
    // #endregion

    const userResponse = await this._registerUser(userRegisterDto);
    res.success(userResponse, "Utilisateur inscrit avec succès");
  }
  async register(req: Request, res: Response): Promise<void> {

    const userRegisterDto: UserCreateDTO = req.body;
    const user = await this._registerUser(userRegisterDto);


    res.success(user, "Utilisateur inscrit avec succès");
  }

  async login(req: Request, res: Response): Promise<void> {
    const userLoginDto: UserLoginDTO = req.body;
    const [user, accessToken] = await this.UC_auth.loginUser(userLoginDto);

    if (!user.id) throw new ValidationError("User id is missing");

    const userResponse: UserReadDTO = user.toReadDTO();

    const tokenResponse: TokenResponse = {
      accessToken,
      tokenType: "bearer",
      expiresIn: 1800,
      user: userResponse,
      role: user.role
    };

    res.success(tokenResponse, "Connexion réussie");
  }
}