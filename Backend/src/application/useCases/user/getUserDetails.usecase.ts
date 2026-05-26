import { IUserRepository } from "../../interfaces/repositories/User/IUserRepository";
import { IGetUserDetailsUseCase } from "../../interfaces/usecases/Auth/getuserDetails.usecase.interface";

import { AuthUserDTO, AuthUserMapper } from "../../mappers/Auth/AuthUserMapper";

export class GetUserDetailsUseCase implements IGetUserDetailsUseCase {
  constructor(private readonly _userRepository: IUserRepository) {}

  async execute(userId: string): Promise<AuthUserDTO> {
    const user = await this._userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    return AuthUserMapper.toAuthUserDTO(user) as AuthUserDTO;
  }
}
