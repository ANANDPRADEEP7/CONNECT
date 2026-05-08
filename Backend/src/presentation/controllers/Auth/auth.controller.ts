import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "../../middleware/AuthMiddleware";
import { LoggerContainer } from "../../../infrastructure/DI/LoggerContainer";
import { HttpStatus } from "../../../domain/enums/HttpStatus.enum";
import { ResponseMessage } from "../../../domain/enums/ResponseMessage.enum";
import { ISignupusecase } from "../../../application/interfaces/usecases/Auth/signup.usecase.interface";
import { IVerifyOtpusecase } from "../../../application/interfaces/usecases/Auth/verifyOtp.usecase.inteface";
import { IResendOtpusecase } from "../../../application/interfaces/usecases/Auth/resendOtp.usecase.interface";
import { ILoginusecase } from "../../../application/interfaces/usecases/Auth/login.usecase.interface";
import { IVerifyEmailUsecase } from "../../../application/interfaces/usecases/Auth/verifyEmail.usecase.interface";
import { IResetPasswordUsecase } from "../../../application/interfaces/usecases/Auth/resetPasswor.usecase.interface";
import { IGoogleLoginUsecase } from "../../../application/interfaces/usecases/Auth/googleLogin.usecase.interface";
import { IGetUserDetailsUseCase } from "../../../application/interfaces/usecases/Auth/getuserDetails.usecase.interface";

const loggerContainer = LoggerContainer.getInstance();
const loggerService = loggerContainer.getLoggerService();


type SignupResult =
  | { user: { _id: string } }
  | { message: string };

export class UserController {
  constructor(
    private readonly signupUsecase: ISignupusecase,
    private readonly verifyOtpUseCase: IVerifyOtpusecase,
    private readonly resendOtpUseCase: IResendOtpusecase,
    private readonly loginUseCase: ILoginusecase,
    private readonly verifyEmailUsecase: IVerifyEmailUsecase,
    private readonly resetPasswordUsecase: IResetPasswordUsecase,
    private readonly googleLoginUsecase: IGoogleLoginUsecase,
    private readonly getUserDetailsUseCase: IGetUserDetailsUseCase 
  ) { }

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;
      console.log(req.body);

      loggerService.logUserAction("Registration attempt", undefined, { email });
   
      const result = (await this.signupUsecase.execute(req.body)) as SignupResult;

      if ("user" in result) {
        loggerService.logUserAction(
          "Registration successful",
          result.user._id,
          { email }
        );
      } else {
        loggerService.logUserAction(
          "Registration completed (no user returned)",
          undefined,
          { email }
        );
      }

      return res.status(HttpStatus.CREATED).json(result);
    } catch (error) {
      next(error);
    }
  };

  VerifyOtp = async (req: Request, res: Response, next: NextFunction) => {
    try {
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
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.clearCookie("token");
      return res
        .status(HttpStatus.OK)
        .json({ message: ResponseMessage.LOGOUT_SUCCESS });
    } catch (error) {
      next(error);
    }
  };

  verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;
      await this.verifyEmailUsecase.execute(email);
      return res.status(HttpStatus.OK).json({
        message: ResponseMessage.PASSWORD_RESET_LINK_SENT,
      });
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token, password } = req.body;
      await this.resetPasswordUsecase.execute(token, password);
      return res.status(HttpStatus.OK).json({
        message: ResponseMessage.PASSWORD_RESET_SUCCESS,
      });
    } catch (error) {
      next(error);
    }
  };

  googleLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token: googleToken } = req.body;

      if (!googleToken) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: "Google ID token is required",
        });
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

      if (!decodedUser || !decodedUser.id) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          message: ResponseMessage.AUTH_REQUIRED,
        });
      }

      const user = await this.getUserDetailsUseCase.execute(decodedUser.id);

      return res.status(HttpStatus.OK).json({ user });
    } catch (error) {
      next(error);
    }
  };
}