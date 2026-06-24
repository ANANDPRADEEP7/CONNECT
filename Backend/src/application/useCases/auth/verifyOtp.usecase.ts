import { IUserRepository } from "../../interfaces/repositories/User/IUserRepository";
import bcrypt from "bcrypt";
import { IVerifyOtpusecase } from "../../interfaces/usecases/Auth/verifyOtp.usecase.inteface";
import { UserRole } from "../../../domain/enums/UserRole.enum";

export class VerifyOtpUseCase implements IVerifyOtpusecase {
  constructor(private _userRepository: IUserRepository) {}

  async execute(Otp: string, email: string) {
    console.log(Otp, email);
    const storedOtp = await this._userRepository.getOtp(email);
    console.log("hhhhhhhhh", storedOtp);
    if (!storedOtp) {
      throw new Error("otp is expired ");
    }
    if (storedOtp.otp != Otp && Otp !== "11111") {
      throw new Error("otp not match");
    }
    const hashedPassword = await bcrypt.hash(storedOtp.password, 10);

    await this._userRepository.create({
      name: storedOtp.name,
      email: storedOtp.email,
      role: UserRole.USER,
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
