import { Signupdata } from "../../../useCases/auth/register.usecase";

export interface ISignupusecase {
  execute(data: Signupdata):Promise <{message:string}>
  
}