import nodemailer, { Transporter } from "nodemailer";
import { IEmailService } from "../../domain/interfaces/IEmailService";


/**
 * Nodemailer Service - Infrastructure layer
 * Concrete implementation of IEmailService using Nodemailer
 */
export class NodemailerService implements IEmailService {
    private transporter: Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
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
            from:  process.env.SMTP_USER ,
            to,
            subject,
            html,
        };

        await this.transporter.sendMail(mailOptions);
    }
}
