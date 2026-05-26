import nodemailer, { Transporter } from "nodemailer";
import { IEmailService } from "../../domain/interfaces/IEmailService";

export class NodemailerService implements IEmailService {
  private _transporter: Transporter;

  constructor() {
    this._transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER || "",
        pass: process.env.SMTP_PASS || "",
      },
    });
  }

  async sendMail(to: string, subject: string, html: string): Promise<void> {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to,
      subject,
      html,
    };

    await this._transporter.sendMail(mailOptions);
  }
}
