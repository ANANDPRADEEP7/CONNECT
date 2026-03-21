import { Request, Response } from "express";
import { LoggerContainer } from "../../../infrastructure/DI/LoggerContainer";
import { SignupUsecase } from "../../../application/useCases/auth/register.usecase";
import { VerifyOtpUseCase } from "../../../application/useCases/auth/verifyOtp.usecase";
import { ResendOtpUseCase } from "../../../application/useCases/auth/resendOtp.usecase";
import { LoginUseCase } from "../../../application/useCases/auth/login.usecase";
import { VerifyEmailUsecase } from "../../../application/useCases/auth/verifyEmail.usecase";
import { ResetPasswordUsecase } from "../../../application/useCases/auth/resetPassword.usecase";
import { GoogleLoginUsecase } from "../../../application/useCases/auth/googleLogin.usecase";



const loggerContainer = LoggerContainer.getInstance();
const loggerService = loggerContainer.getLoggerService();



export class UserController {
  constructor(
    private readonly signupUsecase: SignupUsecase,
    private readonly verifyOtpUseCase: VerifyOtpUseCase,
    private readonly resendOtpUseCase: ResendOtpUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly verifyEmailUsecase: VerifyEmailUsecase,
    private readonly resetPasswordUsecase: ResetPasswordUsecase,
    private readonly googleLoginUsecase: GoogleLoginUsecase
  ) { }




  register = async (req: Request, res: Response) => {
    try {
      const { name, email, password, number } = req.body;
      console.log(req.body)

      loggerService.logUserAction('Registration attempt', undefined, { email });

      const result = await this.signupUsecase.execute(req.body);

      loggerService.logUserAction('Registration successful', (result as any).user?.id, { email });
      res.status(201).json(result);
    } catch (error: any) {
      loggerService.logError(error, 'Registration failed', { email: req.body.email });
      res.status(400).json({ message: error.message });
    }
  };

  VerifyOtp = async (req: Request, res: Response) => {
    try {
      console.log("verify otp", req.body)
      const { otp, email } = req.body;

      const result = await this.verifyOtpUseCase.execute(otp, email);
      return res.status(200).json(result)
    } catch (error: any) {
      res.status(400).json({ message: error.message })
    }
  }

  resendOtp = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      const result = await this.resendOtpUseCase.execute(email);
      return res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const result = await this.loginUseCase.execute(email, password);

      res.cookie("token", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  logout = async (req: Request, res: Response) => {
    res.clearCookie("token");
    return res.status(200).json({ message: "Logged out successfully" });
  };

  verifyEmail = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      await this.verifyEmailUsecase.execute(email);
      return res.status(200).json({ message: "Password reset link sent to your email." });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  resetPassword = async (req: Request, res: Response) => {
    try {
      const { token, password } = req.body;
      await this.resetPasswordUsecase.execute(token, password);
      return res.status(200).json({ message: "Password reset successfully." });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  googleLogin = async (req: Request, res: Response) => {
    try {
      const { token: googleToken } = req.body;

      if (!googleToken) {
        return res.status(400).json({ message: "Google ID token is required" });
      }

      const result = await this.googleLoginUsecase.execute(googleToken);

      res.cookie("token", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };
}
