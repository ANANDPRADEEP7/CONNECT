import { IUserRepository } from "../../interfaces/repositories/User/IUserRepository";
import { IResendOtpusecase } from "../../interfaces/usecases/Auth/resendOtp.usecase.interface";
import { EmailService } from "../../services/EmailService";

export class ResendOtpUseCase implements IResendOtpusecase{
    constructor(
        private userRepository: IUserRepository,
        private emailService: EmailService
    ) { }

    async execute(email: string): Promise<{ message: string }> {
        // 1. Find the existing OTP record to copy the user data
        const existingOtpRecord = await this.userRepository.getOtp(email);

        if (!existingOtpRecord) {
            throw new Error("No pending registration found. Please sign up again.");
        }

        // 2. Delete ONLY the old OTP for this email
        await this.userRepository.deleteOtp(email);

        // 3. Generate a new OTP
        const newOtp = Math.floor(10000 + Math.random() * 90000).toString();
        console.log("Resend OTP:", newOtp);

        // 4. Store the new OTP with the same user data from the old record
        await this.userRepository.storeOtp({
            name: existingOtpRecord.name,
            email: existingOtpRecord.email,
            phonenumber: existingOtpRecord.phonenumber,
            password: existingOtpRecord.password,
            otp: newOtp,
        });

        // 5. Send the new OTP via email
        await this.emailService.sendOtpEmail(email, newOtp);

        return { message: "New OTP sent successfully." };
    }
}

