import { ResponseMessage } from "../../../../domain/enums/ResponseMessage.enum";

import { AuthUserDTO } from "../../../../application/mappers/Auth/AuthUserMapper";

export interface LoginResponse {
  message: ResponseMessage.LOGIN_SUCCESS;
  token: string;
  refreshToken: string;
  user: AuthUserDTO;
}

export interface ILoginusecase {
  execute(email: string, password: string): Promise<LoginResponse>;
}
