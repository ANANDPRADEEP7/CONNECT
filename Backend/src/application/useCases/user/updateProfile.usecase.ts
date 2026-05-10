import { IUserRepository } from "../../interfaces/repositories/User/IUserRepository";
import {
  IUpdateProfileUseCase,
  UpdateProfileRequest,
  UpdateProfileResponse,
} from "../../interfaces/usecases/User/updateProfile.usecase.interface";

export class UpdateProfileUseCase implements IUpdateProfileUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string, profileData: UpdateProfileRequest): Promise<UpdateProfileResponse> {
    const dataToUpdate = {
      ...profileData,
      isRiderActive: "pending",
    };

    await this.userRepository.update(userId, dataToUpdate);

    return {
      message: "Profile updated successfully",
      isRiderActive: "pending",
    };
  }
}
