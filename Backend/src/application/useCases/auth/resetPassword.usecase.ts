import { IUserRepository } from "../../interfaces/repositories/User/IUserRepository";
import { ITokenService } from "../../../domain/interfaces/ITokenService";
import { ICacheService } from "../../../domain/interfaces/ICacheService";
import bcrypt from "bcrypt";
import { IResetPasswordUsecase } from "../../interfaces/usecases/Auth/resetPasswor.usecase.interface";

export class ResetPasswordUsecase implements IResetPasswordUsecase {
  constructor(
    private readonly _userRepository: IUserRepository,
    private readonly _tokenService: ITokenService,
    private readonly _cacheService: ICacheService,
  ) {}

  async execute(token: string, newPassword: string): Promise<void> {
    const userId = this._tokenService.verifyResetToken(token);

    if (!userId) {
      throw new Error("This reset link has expired or is invalid.");
    }

    const cachedToken = await this._cacheService.getResetToken(userId);

    if (!cachedToken || cachedToken !== token) {
      throw new Error("This reset link has already been used or expired.");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this._userRepository.update(userId, { password: hashedPassword });

    await this._cacheService.delete(userId);
  }
}
