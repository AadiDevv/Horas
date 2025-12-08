import { Request, Response } from 'express';
import { AuthUseCase } from '@/application/usecases';
import { UserCreateEmployeeDTO, UserCreateManagerDTO, UserReadEmployeeDTO_Core, UserReadManagerDTO_Core, UserReadDTO_L1, UserReadDTO_Core } from '@/application/DTOS/user.dto';
import { UserLoginDTO, TokenResponse, UserAuthDTO } from '@/application/DTOS/auth.dto';
import { ValidationError } from '@/domain/error/AppError';
import { UserMapper } from '@/application/mappers/user';

/**
 * Contrôleur pour l'authentification
 * Gère les requêtes HTTP pour register/login
 */
export class AuthController {
    constructor(private UC_auth: AuthUseCase) { }

 
    // #region Register
    /**
     * POST /api/auth/register/employe
     * Inscription d'un employé (par manager ou admin)
     */
    async registerEmploye(req: Request, res: Response): Promise<void> {
        req.body.role = 'employe';
        req.body.managerId = req.user?.id;
        const userRegisterDto: UserCreateEmployeeDTO = req.body;

        const userResponse = await this.UC_auth.registerEmployee(userRegisterDto);
        res.success(userResponse, "Utilisateur inscrit avec succès");
    }

    /**
     * POST /api/auth/register/manager
     * Inscription d'un manager (admin uniquement)
     */
    async registerManager(req: Request, res: Response): Promise<void> {
        req.body.role =  'manager';
        const userRegisterDto: UserCreateManagerDTO = req.body;
        const userResponse = await this.UC_auth.registerManager(userRegisterDto);
        res.success(userResponse, "Utilisateur inscrit avec succès");
    }

    /**
     * POST /api/auth/register
     * Auto-inscription publique
     */
 
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

        const userResponse : UserAuthDTO = UserMapper.FromEntityL1.toReadUserAuthDTO_L1(user);

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

