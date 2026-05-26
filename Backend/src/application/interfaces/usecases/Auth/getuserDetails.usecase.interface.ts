import { AuthUserDTO } from "../../../../application/mappers/Auth/AuthUserMapper";

export interface IGetUserDetailsUseCase {
  execute(userId: string): Promise<AuthUserDTO>;
}
