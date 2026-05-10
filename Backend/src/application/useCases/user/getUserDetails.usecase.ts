import { IUserRepository } from "../../interfaces/repositories/User/IUserRepository";
import {
  IGetUserDetailsUseCase,
  User,
} from "../../interfaces/usecases/Auth/getuserDetails.usecase.interface";

export class GetUserDetailsUseCase implements IGetUserDetailsUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isRiderActive: user.isRiderActive,
      isBlocked: user.isBlocked,
    };
  }
}
