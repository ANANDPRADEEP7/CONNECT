import { ResponseMessage } from "../../../../domain/enums/ResponseMessage.enum";

export interface LoginResponse {
  message: ResponseMessage.LOGIN_SUCCESS;
  token: string;
  user: User;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isRiderActive: string | undefined;
  isBlocked: boolean;
  phonenumber: string;
  bio: string | undefined;
  govId: string | undefined;
  vehicleImage: string | undefined;
  pucImage: string | undefined;
  rcImage: string | undefined;
}

export interface ILoginusecase {
  execute(email: string, password: string): Promise<LoginResponse>;
}
