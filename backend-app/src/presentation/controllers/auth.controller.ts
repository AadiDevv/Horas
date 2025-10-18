import { Request, Response } from 'express';
import { AuthUseCase } from '@/application/usecases';
import { UserCreateDTO, UserReadDTO } from '@/application/DTOS/user.dto';
import { UserLoginDTO, TokenResponse } from '@/application/DTOS/auth.dto';
import { ValidationError } from '@/domain/error/AppError';

/**
 * Contrôleur pour l'authentification
 * Gère les requêtes HTTP pour register/login
 */
export class AuthController {
    constructor(private UC_auth: AuthUseCase) { }

    // #region Private Helpers
    private async _registerUser(dto: UserCreateDTO): Promise<UserReadDTO> {
        const user = await this.UC_auth.registerUser(dto);
        return user.toReadDTO();
    }
    // #endregion

    // #region Register
    /**
     * POST /api/auth/register/employe
     * Inscription d'un employé (par manager ou admin)
     */
    async registerEmploye(req: Request, res: Response): Promise<void> {
        const userRegisterDto: UserCreateDTO = req.body;
        if (userRegisterDto.role !== 'employe') {
            throw new ValidationError("User role is not valid");
        }

        const userResponse = await this._registerUser(userRegisterDto);
        res.success(userResponse, "Utilisateur inscrit avec succès");
    }

    /**
     * POST /api/auth/register/manager
     * Inscription d'un manager (admin uniquement)
     */
    async registerManager(req: Request, res: Response): Promise<void> {
        const userRegisterDto: UserCreateDTO = req.body;
        if (userRegisterDto.role !== 'manager') {
            throw new ValidationError("User role is not valid");
        }

        const userResponse = await this._registerUser(userRegisterDto);
        res.success(userResponse, "Utilisateur inscrit avec succès");
    }

    /**
     * POST /api/auth/register
     * Auto-inscription publique
     */
    async register(req: Request, res: Response): Promise<void> {
        const userRegisterDto: UserCreateDTO = req.body;
        const user = await this._registerUser(userRegisterDto);

        res.success(user, "Utilisateur inscrit avec succès");
    }
    // #endregion

    // #region Login
    /**
     * POST /api/auth/login
     * Connexion utilisateur
     */
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
    // #endregion
}

