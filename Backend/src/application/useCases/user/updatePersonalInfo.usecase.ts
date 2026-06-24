import { IUserRepository } from "../../interfaces/repositories/User/IUserRepository";
import {
  IUpdatePersonalInfoUseCase,
  UpdatePersonalInfoRequest,
  UpdatePersonalInfoResponse,
} from "../../interfaces/usecases/User/updatePersonalInfo.usecase.interface";

export class UpdatePersonalInfoUseCase implements IUpdatePersonalInfoUseCase {
  constructor(private readonly _userRepository: IUserRepository) {}

  async execute(
    userId: string,
    data: UpdatePersonalInfoRequest,
  ): Promise<UpdatePersonalInfoResponse> {
    // Guard: Google-authenticated users cannot change their email
    if (data.email !== undefined) {
      const user = await this._userRepository.findById(userId);
      if (user?.authProvider === "google") {
        throw Object.assign(new Error("Google-authenticated users cannot change their email."), {
          statusCode: 400,
        });
      }
    }

    const updateData: Partial<UpdatePersonalInfoRequest> = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.phonenumber !== undefined) updateData.phonenumber = data.phonenumber;

    await this._userRepository.update(userId, updateData);

    return {
      message: "Personal information updated successfully",
      ...updateData,
    };
  }
}
