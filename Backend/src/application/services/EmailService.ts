import { IEmailService } from "../../domain/interfaces/IEmailService";

/**
 * Email Service - Application layer
 * Provides email functionality to the application layer
 * Depends on abstraction (IEmailService) not concrete implementation
 */
export class EmailService {
  constructor(private _emailService: IEmailService) {}

  /**
   * Send a raw email
   */
  async sendMail(to: string, subject: string, html: string): Promise<void> {
    await this._emailService.sendMail(to, subject, html);
  }

  /**
   * Send OTP verification email
   */
  async sendOtpEmail(email: string, otp: string): Promise<void> {
    const subject = "CONNECT - Verify Your Email";
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #18181b; border-radius: 16px; color: #fff;">
        <h2 style="text-align: center; color: #a78bfa;">CONNECT</h2>
        <p style="text-align: center; font-size: 16px; color: #d4d4d8;">Your OTP verification code is:</p>
        <div style="text-align: center; margin: 24px 0;">
          <span style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 16px 32px; background: #27272a; border-radius: 12px; color: #a78bfa;">
            ${otp}
          </span>
        </div>
        <p style="text-align: center; font-size: 14px; color: #71717a;">This code will expire in 5 minutes. Do not share it with anyone.</p>
      </div>
    `;

    await this._emailService.sendMail(email, subject, html);
  }
}
