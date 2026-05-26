import { IUserRepository } from "../../interfaces/repositories/User/IUserRepository";
import { IToggleBlockUserUseCase } from "../../interfaces/usecases/Admin/toggleBlockUser.usecase.interface";

export class ToggleBlockUserUseCase implements IToggleBlockUserUseCase {
  constructor(private _userRepository: IUserRepository) {}

  async execute(userId: string) {
    const user = await this._userRepository.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    const newBlockedStatus = !user.isBlocked;
    await this._userRepository.update(userId, { isBlocked: newBlockedStatus });

    return {
      message: `User ${newBlockedStatus ? "blocked" : "unblocked"} successfully`,
      isBlocked: newBlockedStatus,
    };
  }
}
