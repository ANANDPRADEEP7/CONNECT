export interface IResendOtpusecase {
  execute(email: string): Promise<{ message: string }>;
}
