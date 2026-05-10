import { IUserRepository } from "../../interfaces/repositories/User/IUserRepository";
import bcrypt from "bcrypt";
import { IVerifyOtpusecase } from "../../interfaces/usecases/Auth/verifyOtp.usecase.inteface";

export class VerifyOtpUseCase implements IVerifyOtpusecase {
  constructor(private userRepository: IUserRepository) {}

  async execute(Otp: string, email: string) {
    console.log(Otp, email);
    const storedOtp = await this.userRepository.getOtp(email);
    console.log("hhhhhhhhh", storedOtp);
    if (!storedOtp) {
      throw new Error("otp is expired ");
    }
    if (storedOtp.otp != Otp) {
      throw new Error("otp not match");
    }
    const hashedPassword = await bcrypt.hash(storedOtp.password, 10);

    const user = await this.userRepository.create({
      name: storedOtp.name,
      email: storedOtp.email,
      role: "user",
      phonenumber: storedOtp.phonenumber,
      password: hashedPassword,
      isBlocked: false,
      isVerified: false,
    });

    return {
      message: "OTP VERIFICATION COMPLECT",
    };
  }
}
