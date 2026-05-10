import { IUserRepository } from "../../interfaces/repositories/User/IUserRepository";
import { ISignupusecase } from "../../interfaces/usecases/Auth/signup.usecase.interface";
import { EmailService } from "../../services/EmailService";

export interface Signupdata {
  username: string;
  email: string;
  phone: number;
  password: string;
}

export class SignupUsecase implements ISignupusecase {
  constructor(
    private userRepository: IUserRepository,
    private emailService: EmailService,
  ) {}

  async execute(data: Signupdata) {
    const existingUser = await this.userRepository.findByEmail(data.email);

    if (existingUser) {
      throw new Error("User already exists");
    }

    const otp = Math.floor(10000 + Math.random() * 90000).toString();
    console.log("otp", otp);

    await this.userRepository.storeOtp({
      name: data.username,
      email: data.email,
      phonenumber: String(data.phone),
      password: data.password,
      otp: otp,
    });
    console.log("abcjcjdhkfdiferifhrrhrggh");

    // Send OTP via email
    await this.emailService.sendOtpEmail(data.email, otp);

    return {
      message: "User registered successfully. OTP sent.",
    };
  }
}
