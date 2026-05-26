import { IUserRepository } from "../../interfaces/repositories/User/IUserRepository";
import {
  IUpdateProfileUseCase,
  UpdateProfileRequest,
  UpdateProfileResponse,
} from "../../interfaces/usecases/User/updateProfile.usecase.interface";
import { RiderStatus } from "../../../domain/enums/UserRole.enum";

export class UpdateProfileUseCase implements IUpdateProfileUseCase {
  constructor(private readonly _userRepository: IUserRepository) {}

  async execute(userId: string, profileData: UpdateProfileRequest): Promise<UpdateProfileResponse> {
    const dataToUpdate = {
      ...profileData,
      isRiderActive: RiderStatus.PENDING,
    };

    await this._userRepository.update(userId, dataToUpdate);

    return {
      message: "Profile updated successfully",
      isRiderActive: RiderStatus.PENDING,
    };
  }
}
