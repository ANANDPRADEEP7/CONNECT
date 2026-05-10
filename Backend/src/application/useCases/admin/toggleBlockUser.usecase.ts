import { IUserRepository } from "../../interfaces/repositories/User/IUserRepository";
import { IToggleBlockUserUseCase } from "../../interfaces/usecases/Admin/toggleBlockUser.usecase.interface";

export class ToggleBlockUserUseCase implements IToggleBlockUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: string) {
    // Since we need to toggle, we first need to know the current status
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    const newBlockedStatus = !user.isBlocked;
    await this.userRepository.update(userId, { isBlocked: newBlockedStatus });

    return {
      message: `User ${newBlockedStatus ? "blocked" : "unblocked"} successfully`,
      isBlocked: newBlockedStatus,
    };
  }
}
