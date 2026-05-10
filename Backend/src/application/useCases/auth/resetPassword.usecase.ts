import { IUserRepository } from "../../interfaces/repositories/User/IUserRepository";
import { ITokenService } from "../../../domain/interfaces/ITokenService";
import { ICacheService } from "../../../domain/interfaces/ICacheService";
import bcrypt from "bcrypt";
import { IResetPasswordUsecase } from "../../interfaces/usecases/Auth/resetPasswor.usecase.interface";

/**
 * ResetPasswordUsecase
 * Verifies the reset token, checks the cache, hashes the new password,
 * updates the user, and invalidates the cache entry.
 */
export class ResetPasswordUsecase implements IResetPasswordUsecase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly tokenService: ITokenService,
    private readonly cacheService: ICacheService,
  ) {}

  async execute(token: string, newPassword: string): Promise<void> {
    const userId = this.tokenService.verifyResetToken(token);

    if (!userId) {
      throw new Error("This reset link has expired or is invalid.");
    }

    const cachedToken = await this.cacheService.getResetToken(userId);

    if (!cachedToken || cachedToken !== token) {
      throw new Error("This reset link has already been used or expired.");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.userRepository.update(userId, { password: hashedPassword });

    await this.cacheService.delete(userId);
  }
}
