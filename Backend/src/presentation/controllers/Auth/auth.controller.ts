import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "../../middleware/AuthMiddleware";
import { LoggerContainer } from "../../../infrastructure/DI/LoggerContainer";
import { SignupUsecase } from "../../../application/useCases/auth/register.usecase";
import { VerifyOtpUseCase } from "../../../application/useCases/auth/verifyOtp.usecase";
import { ResendOtpUseCase } from "../../../application/useCases/auth/resendOtp.usecase";
import { LoginUseCase } from "../../../application/useCases/auth/login.usecase";
import { VerifyEmailUsecase } from "../../../application/useCases/auth/verifyEmail.usecase";
import { ResetPasswordUsecase } from "../../../application/useCases/auth/resetPassword.usecase";
import { GoogleLoginUsecase } from "../../../application/useCases/auth/googleLogin.usecase";
import { GetUserDetailsUseCase } from "../../../application/useCases/user/getUserDetails.usecase";
import { HttpStatus } from "../../../domain/enums/HttpStatus.enum";
import { ResponseMessage } from "../../../domain/enums/ResponseMessage.enum";



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
    private readonly googleLoginUsecase: GoogleLoginUsecase,
    private readonly getUserDetailsUseCase: GetUserDetailsUseCase
  ) { }




  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;
      console.log(req.body);

      loggerService.logUserAction('Registration attempt', undefined, { email });

      const result = await this.signupUsecase.execute(req.body);

      loggerService.logUserAction('Registration successful', result.user?._id, { email });
      res.status(HttpStatus.CREATED).json(result);
    } catch (error) {
      next(error);
    }
  };

  VerifyOtp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("verify otp", req.body);
      const { otp, email } = req.body;

      const result = await this.verifyOtpUseCase.execute(otp, email);
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  resendOtp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;
      const result = await this.resendOtpUseCase.execute(email);
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const result = await this.loginUseCase.execute(email, password);

      res.cookie("token", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.clearCookie("token");
      return res.status(HttpStatus.OK).json({ message: ResponseMessage.LOGOUT_SUCCESS });
    } catch (error) {
      next(error);
    }
  };

  verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;
      await this.verifyEmailUsecase.execute(email);
      return res.status(HttpStatus.OK).json({ message: ResponseMessage.PASSWORD_RESET_LINK_SENT });
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token, password } = req.body;
      await this.resetPasswordUsecase.execute(token, password);
      return res.status(HttpStatus.OK).json({ message: ResponseMessage.PASSWORD_RESET_SUCCESS });
    } catch (error) {
      next(error);
    }
  };

  googleLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token: googleToken } = req.body;

      if (!googleToken) {
        return res.status(HttpStatus.BAD_REQUEST).json({ message: "Google ID token is required" });
      }

      const result = await this.googleLoginUsecase.execute(googleToken);

      res.cookie("token", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  me = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const decodedUser = req.user;
      console.log("decodedUser", decodedUser);
      if (!decodedUser || !decodedUser.id) {
        return res.status(HttpStatus.UNAUTHORIZED).json({ message: ResponseMessage.AUTH_REQUIRED });
      }

      const user = await this.getUserDetailsUseCase.execute(decodedUser.id);
      return res.status(HttpStatus.OK).json({ user });
    } catch (error) {
      next(error);
    }
  };
}
