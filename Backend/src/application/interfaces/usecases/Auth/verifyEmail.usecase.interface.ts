
export interface IVerifyEmailUsecase{
   execute(email: string): Promise<void>
}