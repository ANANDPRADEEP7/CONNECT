import { IUserRepository } from "../../interfaces/repositories/User/IUserRepository";
import { ITokenService } from "../../../domain/interfaces/ITokenService";
import bcrypt from "bcrypt";
import { ResponseMessage } from "../../../domain/enums/ResponseMessage.enum";
import { IAdminLoginUseCase } from "../../interfaces/usecases/Admin/adminLogin.usecase.interface";
import { UserRole } from "../../../domain/enums/UserRole.enum";

export class AdminLoginUseCase implements IAdminLoginUseCase {
  constructor(
    private _userRepository: IUserRepository,
    private _tokenService: ITokenService,
  ) {}

  async execute(email: string, password: string) {
    const user = await this._userRepository.findByEmailFromDB(email);
    if (!user) {
      throw new Error(ResponseMessage.USER_NOT_FOUND);
    }

    if (user.role !== UserRole.ADMIN) {
      throw new Error(ResponseMessage.NOT_AUTHORIZED);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error(ResponseMessage.INCORRECT_PASSWORD);
    }

    const tokenPayload = {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const token = this._tokenService.generateAuthToken(tokenPayload);
    const refreshToken = this._tokenService.generateRefreshToken(tokenPayload);

    return {
      message: ResponseMessage.ADMIN_LOGIN_SUCCESS,
      token,
      refreshToken,
      admin: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}
