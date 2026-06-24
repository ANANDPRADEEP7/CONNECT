import { IUserRepository } from "../../interfaces/repositories/User/IUserRepository";
import { GoogleAuthService } from "../../../infrastructure/services/GoogleAuthService";
import { ITokenService } from "../../../domain/interfaces/ITokenService";
import { IGoogleLoginUsecase } from "../../interfaces/usecases/Auth/googleLogin.usecase.interface";
import { AuthUserMapper } from "../../mappers/Auth/AuthUserMapper";
import { UserRole } from "../../../domain/enums/UserRole.enum";

export class GoogleLoginUsecase implements IGoogleLoginUsecase {
  constructor(
    private readonly _userRepository: IUserRepository,
    private readonly _googleAuthService: GoogleAuthService,
    private readonly _tokenService: ITokenService,
  ) {}

  async execute(accessToken: string) {
    const googleUser = await this._googleAuthService.verifyAccessToken(accessToken);

    const { email, name, sub: googleId } = googleUser;
    let user = await this._userRepository.findByEmailFromDB(email);

    if (user) {
      if (user.isBlocked) {
        throw new Error("Your account has been blocked. Contact support.");
      }
    } else {
      user = await this._userRepository.create({
        name: name || email.split("@")[0],
        email,
        phonenumber: "",
        password: `google_${googleId}`,
        role: UserRole.USER,
        isBlocked: false,
        isVerified: true,
        authProvider: "google",
      });
    }

    const tokenPayload = {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const token = this._tokenService.generateAuthToken(tokenPayload);
    const refreshToken = this._tokenService.generateRefreshToken(tokenPayload);

    return {
      message: "Google login successful",
      token,
      refreshToken,
      user: AuthUserMapper.toAuthUserDTO(user),
    };
  }
}
