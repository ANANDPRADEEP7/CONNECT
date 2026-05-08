
export interface IVerifyOtpusecase{
  execute(Otp:string,email:string):Promise<{message:string}>
}
