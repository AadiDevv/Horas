import { UserCreateEmployeeDTO, UserCreateManagerDTO, UserLoginDTO } from "@/application/DTOS/";
import { User_Core, User_L1, UserManager_Core, UserEmployee_Core } from "@/domain/entities/user";
import { IAuth } from "@/domain/interfaces/auth.interface";
import { AlreadyExistsError, InvalidCredentialsError } from "@/domain/error/AppError";
import { JWTService, ValidateService } from "@/application/services/";
import { UserMapper } from "../mappers/";
import { IUser } from "@/domain/interfaces/user.interface";

/**
 * Use Case pour l'authentification
 * Gère l'inscription et la connexion des utilisateurs
 */
export class AuthUseCase {

    constructor(private readonly R_auth: IAuth & IUser) { }


    async registerManager(dto: UserCreateManagerDTO): Promise<UserManager_Core> {
        // #region - Verification
        ValidateService.validatePassword(dto.password)
        const hashedPassword = JWTService.hashedPassword(dto.password)

        const user = UserMapper.FromDTO.CreateManager_ToEntityCore(dto, hashedPassword, "manager")
        user.validateManager();

        const userWithEmailExist : User_L1 | null = await this.R_auth.getUserL1_ByEmail(user.email)
        if (userWithEmailExist != null) {
            throw new AlreadyExistsError("User already exists")

        }
        // #endregion

        const createdUser = await this.R_auth.registerManager(user) // [Communication Bdd] Possibilité de lever une erreur ici

        const managerEntity = new UserManager_Core({ ...createdUser })

        return managerEntity;
    }
    
    async registerEmployee(dto: UserCreateEmployeeDTO): Promise<UserEmployee_Core> {
        // #region - Verification
        ValidateService.validatePassword(dto.password)
        const hashedPassword = JWTService.hashedPassword(dto.password)

        const user = UserMapper.FromDTO.CreateEmployee_ToEntityCore(dto, hashedPassword, "employe")
        user.validateEmployee();

        const userWithEmailExist : User_L1 | null = await this.R_auth.getUserL1_ByEmail(user.email)

        if (userWithEmailExist != null) {
            throw new AlreadyExistsError("User with this email already exists")
        }
        // #endregion

        const createdUser = await this.R_auth.registerEmployee(user) // [Communication Bdd] Possibilité de lever une erreur ici

        const employeeEntity = new UserEmployee_Core({ ...createdUser })

        return employeeEntity;
    }
    // #endregion

    // #region Login
    async loginUser(userDTO: UserLoginDTO): Promise<[User_L1, string]> {

        // #region - Verify email and password

        const user: User_L1 | null = await this.R_auth.getUserL1_ByEmail(userDTO.email)
        if (!user) throw new InvalidCredentialsError('No user with matching email found')

        const isPasswordValid = await user.verifyPassword(userDTO.password)
        if (!isPasswordValid) throw new InvalidCredentialsError('Invalid password')

        // #endregion

        // Update last login

        user.updateLastLogin()
        const updated_user = new User_L1({ ...await this.R_auth.updateUserLogin_byId(user) })

        // Create token
        const JwtSrv = new JWTService()
        const token = JwtSrv.createAccessToken(updated_user)
        // #endregion

        return [updated_user, token]
    }
    // #endregion
}

