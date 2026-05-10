import { IUserRepository } from "../../interfaces/repositories/User/IUserRepository";
import { GoogleAuthService } from "../../../infrastructure/services/GoogleAuthService";
import { ITokenService } from "../../../domain/interfaces/ITokenService";
import { IGoogleLoginUsecase } from "../../interfaces/usecases/Auth/googleLogin.usecase.interface";

export class GoogleLoginUsecase implements IGoogleLoginUsecase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly googleAuthService: GoogleAuthService,
    private readonly tokenService: ITokenService,
  ) {}

  async execute(accessToken: string) {
    // 1. Verify the Google access_token and get user info
    const googleUser = await this.googleAuthService.verifyAccessToken(accessToken);

    const { email, name, sub: googleId } = googleUser;

    // 2. Check if a user with this email already exists in MongoDB
    let user = await this.userRepository.findByEmailFromDB(email);

    if (user) {
      // 2a. If user exists and is blocked, deny access
      if (user.isBlocked) {
        throw new Error("Your account has been blocked. Contact support.");
      }
      // 2b. Existing user — just sign the token below
    } else {
      // 3. New user — create them (no OTP needed for Google auth)
      user = await this.userRepository.create({
        name: name || email.split("@")[0],
        email,
        phonenumber: "", // Google doesn't provide a phone number
        password: `google_${googleId}`, // placeholder — user won't use this
        role: "user",
        isBlocked: false,
        isVerified: true, // email is already verified by Google
      });
    }

    // 4. Sign a JWT using service
    const token = this.tokenService.generateAuthToken({
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    return {
      message: "Google login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}
