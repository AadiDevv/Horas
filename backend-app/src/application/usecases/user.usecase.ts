import { UserCreateDTO, UserLoginDTO } from "@/application/DTOS/";
import { User } from "@/domain/entities/user";
import { IAuth } from "@/domain/interfaces/auth.interface";
import { AlreadyExistsError, InvalidCredentialsError } from "@/domain/error/AppError";
import { JWTService } from "@/application/services/";

export class AuthUseCase {

    constructor(private readonly R_auth: IAuth) { }

    async registerUser(dto: UserCreateDTO): Promise<User> {
        // #region - Verification
        User.validateDTO(dto) // Validation implicite : si email, mdp, username etc.. sont invalides, une erreur est levée
        const hashedPassword = JWTService.hashedPassword(dto.password)

        const user = User.fromCreateDTO(dto, hashedPassword)
        const bdUser = await this.R_auth.getUser_ByEmail(user.email)
        if (bdUser != null) {
            throw new AlreadyExistsError("User already exists")

        }
        // #endregion

        const createdUser = await this.R_auth.registerUser(user) // [Communication Bdd] Possibilité de lever une erreur ici

        const userEntity = new User({ ...createdUser })

        return userEntity;
    }
    
    async loginUser(userDTO: UserLoginDTO): Promise<[User, string]> {
        // #region - Verify email and password
        const user: User | null = await this.R_auth.getUser_ByEmail(userDTO.email)
        if (!user) throw new InvalidCredentialsError('No user with matching email found')
        const isPasswordValid = await user.verifyPassword(userDTO.password)
        if (!isPasswordValid) throw new InvalidCredentialsError('Invalid password')
        // #endregion

        // #region - Update last login
        user.updateLastLogin()
        const updated_user = new User({ ...await this.R_auth.updateUserLogin_byId(user) })
        // #endregion

        // #region - Create token
        const JwtSrv = new JWTService()
        const token = JwtSrv.createAccessToken(updated_user)
        // #endregion

        return [updated_user, token]
    }
    // async deleteUser(userId: string): Promise<{ message: string }>{

    // }


}