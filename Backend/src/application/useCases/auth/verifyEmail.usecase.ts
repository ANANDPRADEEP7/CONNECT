import { IUserRepository } from "../../interfaces/repositories/User/IUserRepository";
import { IEmailService } from "../../../domain/interfaces/IEmailService";
import { ITokenService } from "../../../domain/interfaces/ITokenService";
import { ICacheService } from "../../../domain/interfaces/ICacheService";

const CLIENT_URL = process.env.FRONTEND_URL || "http://localhost:5173";

export class VerifyEmailUsecase {
  constructor(
    private readonly _userRepository: IUserRepository,
    private readonly _emailService: IEmailService,
    private readonly _tokenService: ITokenService,
    private readonly _cacheService: ICacheService,
  ) {}

  async execute(email: string): Promise<void> {
    const user = await this._userRepository.findByEmailFromDB(email);

    if (!user || !user._id) {
      throw new Error("User not found");
    }

    const userId = user._id.toString();

    const token = this._tokenService.generateResetToken(userId);

    await this._cacheService.storeResetToken(userId, token, 10 * 60);

    const resetLink = `${CLIENT_URL}/reset-password?token=${token}`;

    const subject = "CONNECT - Password Reset Request";
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #18181b; border-radius: 16px; color: #fff;">
        <h2 style="text-align: center; color: #a78bfa;">CONNECT</h2>
        <p style="text-align: center; font-size: 16px; color: #d4d4d8;">You requested to reset your password.</p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${resetLink}"
             style="display: inline-block; padding: 14px 32px; background: #a78bfa; color: #18181b; font-weight: bold; border-radius: 8px; text-decoration: none; font-size: 16px;">
            Reset Password
          </a>
        </div>
        <p style="text-align: center; font-size: 13px; color: #71717a;">This link will expire in 10 minutes. If you did not request this, you can ignore this email.</p>
      </div>
    `;

    await this._emailService.sendMail(email, subject, html);
  }
}
