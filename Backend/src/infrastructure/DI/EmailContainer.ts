import { EmailService } from "../../application/services/EmailService";
import { IEmailService } from "../../domain/interfaces/IEmailService";
import { NodemailerService } from "../services/NodemailerService";

/**
 * Dependency Injection Container for Email
 * Manages the lifecycle and dependencies of email service instances
 * Following Dependency Inversion Principle
 */
export class EmailContainer {
    private static instance: EmailContainer;
    private emailService: EmailService;

    private constructor() {
        // Infrastructure dependency
        const nodemailerService: IEmailService = new NodemailerService();

        // Application service with injected dependency
        this.emailService = new EmailService(nodemailerService);
    }

    public static getInstance(): EmailContainer {
        if (!EmailContainer.instance) {
            EmailContainer.instance = new EmailContainer();
        }
        return EmailContainer.instance;
    }

    /**
     * Get the email service instance
     */
    public getEmailService(): EmailService {
        return this.emailService;
    }
}
