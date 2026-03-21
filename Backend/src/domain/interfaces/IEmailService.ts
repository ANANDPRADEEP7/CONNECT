/**
 * Email Service interface - Domain layer abstraction
 * Defines the contract for email sending operations
 */
export interface IEmailService {
    sendMail(to: string, subject: string, html: string): Promise<void>;
}
