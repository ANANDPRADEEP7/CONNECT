import { EmailService } from "../../application/services/EmailService";
import { IEmailService } from "../../domain/interfaces/IEmailService";
import { NodemailerService } from "../services/NodemailerService";

export class EmailContainer {
  private static _instance: EmailContainer;
  private _emailService: EmailService;

  private constructor() {
    // Infrastructure dependency
    const nodemailerService: IEmailService = new NodemailerService();

    // Application service with injected dependency
    this._emailService = new EmailService(nodemailerService);
  }

  public static getInstance(): EmailContainer {
    if (!EmailContainer._instance) {
      EmailContainer._instance = new EmailContainer();
    }
    return EmailContainer._instance;
  }

  /**
   * Get the email service instance
   */
  public getEmailService(): EmailService {
    return this._emailService;
  }
}
