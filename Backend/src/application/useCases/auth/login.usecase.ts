import { IUserRepository } from "../../interfaces/repositories/User/IUserRepository";
import { ITokenService } from "../../../domain/interfaces/ITokenService";
import bcrypt from "bcrypt";
import { ResponseMessage } from "../../../domain/enums/ResponseMessage.enum";
import {
  ILoginusecase,
  LoginResponse,
} from "../../interfaces/usecases/Auth/login.usecase.interface";
import { AuthUserMapper } from "../../mappers/Auth/AuthUserMapper";

export class LoginUseCase implements ILoginusecase {
  constructor(
    private _userRepository: IUserRepository,
    private _tokenService: ITokenService,
  ) {}

  async execute(email: string, password: string): Promise<LoginResponse> {
    const user = await this._userRepository.findByEmailFromDB(email);
    if (!user) {
      throw new Error(ResponseMessage.USER_NOT_FOUND);
    }

    if (user.isBlocked) {
      throw new Error(ResponseMessage.USER_BLOCKED);
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
      message: ResponseMessage.LOGIN_SUCCESS,
      token,
      refreshToken,
      user: AuthUserMapper.toAuthUserDTO(user),
    };
  }
}
