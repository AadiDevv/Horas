import { UserCreateDTO, UserCreateEmployeeDTO, UserCreateManagerDTO, UserLoginDTO } from "@/application/DTOS/";
import { User, User_Core, User_L1 } from "@/domain/entities/user";
import { IAuth } from "@/domain/interfaces/auth.interface";
import { AlreadyExistsError, InvalidCredentialsError } from "@/domain/error/AppError";
import { JWTService } from "@/application/services/";

/**
 * Use Case pour l'authentification
 * Gère l'inscription et la connexion des utilisateurs
 */
export class AuthUseCase {

    constructor(private readonly R_auth: IAuth) { }

    // #region Register
    async registerUser(dto: UserCreateDTO): Promise<User> {
        // #region - Verification
        User.validateDTO(dto) // Validation implicite : si email, mdp, username etc.. sont invalides, une erreur est levée
        const hashedPassword = JWTService.hashedPassword(dto.password)

        const user = User.fromCreateDTO(dto, hashedPassword)
        user.validateMe();

        const bdUser = await this.R_auth.getUser_ByEmail(user.email)
        if (bdUser != null) {
            throw new AlreadyExistsError("User already exists")

        }
        // #endregion

        const createdUser = await this.R_auth.registerEmployee(user) // [Communication Bdd] Possibilité de lever une erreur ici

        const userEntity = new User({ ...createdUser })

        return userEntity;
    }
    async registerManager(dto: UserCreateManagerDTO): Promise<User> {
        // #region - Verification
        User.validateDTO(dto) // Validation implicite : si email, mdp, username etc.. sont invalides, une erreur est levée
        const hashedPassword = JWTService.hashedPassword(dto.password)

        const user = User.fromCreateDTO(dto, hashedPassword)
        user.validateManager();

        const bdUser = await this.R_auth.getUser_ByEmail(user.email)
        if (bdUser != null) {
            throw new AlreadyExistsError("User already exists")

        }
        // #endregion

        const createdUser = await this.R_auth.registerManager(user) // [Communication Bdd] Possibilité de lever une erreur ici

        const userEntity = new User({ ...createdUser })

        return userEntity;
    }
    async registerEmployee(dto: UserCreateEmployeeDTO): Promise<User> {
        // #region - Verification
        User.validateDTO(dto) // Validation implicite : si email, mdp, username etc.. sont invalides, une erreur est levée
        const hashedPassword = JWTService.hashedPassword(dto.password)

        const user = User.fromCreateEmployeeDTO(dto, hashedPassword)
        user.validateEmployee();

        const bdUser = await this.R_auth.getUser_ByEmail(user.email)

        if (bdUser != null) {
            throw new AlreadyExistsError("User with this email already exists")
        }
        // #endregion

        const createdUser = await this.R_auth.registerEmployee(user) // [Communication Bdd] Possibilité de lever une erreur ici

        const userEntity = new User({ ...createdUser })

        return userEntity;
    }
    // #endregion

    // #region Login
    async loginUser(userDTO: UserLoginDTO): Promise<[User, string]> {
        // #region - Verify email and password
        const user: User_L1 | null = await this.R_auth.getUser_ByEmail(userDTO.email)
        if (!user) throw new InvalidCredentialsError('No user with matching email found')
        const isPasswordValid = await user.verifyPassword(userDTO.password)
        if (!isPasswordValid) throw new InvalidCredentialsError('Invalid password')
        // #endregion

        // #region - Update last login
        user.updateLastLogin()
        const updated_user = new User_L1({ ...await this.R_auth.updateUserLogin_byId(user) })
        // #endregion

        // #region - Create token
        const JwtSrv = new JWTService()
        const token = JwtSrv.createAccessToken(updated_user)
        // #endregion

        return [updated_user, token]
    }
    // #endregion
}

