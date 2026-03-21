import { IUserRepository } from "../../interfaces/repositories/User/IUserRepository";

export class UpdateProfileUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string, profileData: Record<string, any>): Promise<void> {
    console.log("Profile Data:", profileData);

    const dataToUpdate = {
      ...profileData,
      isRiderActive: "pending",
    };

    await this.userRepository.update(userId, dataToUpdate);
  }
}