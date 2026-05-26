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
import {
  validateRegisterBody,
  validateLoginBody,
  validateOtpBody,
  validateVerifyEmailBody,
  validateResetPasswordBody,
  validateGoogleLoginBody,
} from "../../validationSchemas/auth.validation";
import { ITokenService } from "../../../domain/interfaces/ITokenService";
import { createApiResponse } from "../../utils/apiResponse";

const loggerContainer = LoggerContainer.getInstance();
const loggerService = loggerContainer.getLoggerService();

type SignupResult = { user: { _id: string } } | { message: string };

export class UserController {
  constructor(
    private readonly _signupUsecase: ISignupusecase,
    private readonly _verifyOtpUseCase: IVerifyOtpusecase,
    private readonly _resendOtpUseCase: IResendOtpusecase,
    private readonly _loginUseCase: ILoginusecase,
    private readonly _verifyEmailUsecase: IVerifyEmailUsecase,
    private readonly _resetPasswordUsecase: IResetPasswordUsecase,
    private readonly _googleLoginUsecase: IGoogleLoginUsecase,
    private readonly _getUserDetailsUseCase: IGetUserDetailsUseCase,
    private readonly _tokenService: ITokenService,
  ) {}

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = validateRegisterBody(req.body);
      if (!validation.valid) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json(
            createApiResponse(HttpStatus.BAD_REQUEST, validation.message || "Validation failed"),
          );
      }

      const { email } = req.body;

      loggerService.logUserAction("Registration attempt", undefined, { email });

      const result = (await this._signupUsecase.execute(req.body)) as SignupResult;

      if ("user" in result) {
        loggerService.logUserAction("Registration successful", result.user._id, { email });
      } else {
        loggerService.logUserAction("Registration completed (no user returned)", undefined, {
          email,
        });
      }

      const message = "message" in result ? result.message : "User registered successfully";
      return res
        .status(HttpStatus.CREATED)
        .json(createApiResponse(HttpStatus.CREATED, message, result));
    } catch (error) {
      next(error);
    }
  };

  VerifyOtp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = validateOtpBody(req.body);
      if (!validation.valid) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json(
            createApiResponse(HttpStatus.BAD_REQUEST, validation.message || "Validation failed"),
          );
      }

      const { otp, email } = req.body;

      const result = await this._verifyOtpUseCase.execute(otp, email);
      return res
        .status(HttpStatus.OK)
        .json(createApiResponse(HttpStatus.OK, "OTP verified successfully", result));
    } catch (error) {
      next(error);
    }
  };

  resendOtp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = validateVerifyEmailBody(req.body);
      if (!validation.valid) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json(
            createApiResponse(HttpStatus.BAD_REQUEST, validation.message || "Validation failed"),
          );
      }

      const { email } = req.body;
      const result = await this._resendOtpUseCase.execute(email);
      return res
        .status(HttpStatus.OK)
        .json(createApiResponse(HttpStatus.OK, "OTP resent successfully", result));
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = validateLoginBody(req.body);
      if (!validation.valid) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json(
            createApiResponse(HttpStatus.BAD_REQUEST, validation.message || "Validation failed"),
          );
      }

      const { email, password } = req.body;
      const result = await this._loginUseCase.execute(email, password);

      const cookieOpts = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
      };

      res.cookie("token", result.token, { ...cookieOpts, maxAge: 15 * 60 * 1000 });
      res.cookie("refreshToken", result.refreshToken, {
        ...cookieOpts,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      const { refreshToken: _rt, ...safeResult } = result;
      void _rt;
      return res
        .status(HttpStatus.OK)
        .json(createApiResponse(HttpStatus.OK, "Logged in successfully", safeResult));
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.clearCookie("token");
      res.clearCookie("refreshToken");
      return res
        .status(HttpStatus.OK)
        .json(createApiResponse(HttpStatus.OK, ResponseMessage.LOGOUT_SUCCESS));
    } catch (error) {
      next(error);
    }
  };

  refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = req.cookies?.refreshToken;
      if (!refreshToken) {
        return res
          .status(HttpStatus.UNAUTHORIZED)
          .json(createApiResponse(HttpStatus.UNAUTHORIZED, "No refresh token"));
      }

      const payload = this._tokenService.verifyRefreshToken(refreshToken);
      if (!payload) {
        return res
          .status(HttpStatus.UNAUTHORIZED)
          .json(createApiResponse(HttpStatus.UNAUTHORIZED, "Invalid or expired refresh token"));
      }

      const newAccessToken = this._tokenService.generateAuthToken({
        id: payload.id,
        email: payload.email,
        role: payload.role,
        name: payload.name,
      });

      res.cookie("token", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 15 * 60 * 1000,
      });

      return res
        .status(HttpStatus.OK)
        .json(createApiResponse(HttpStatus.OK, "Token refreshed successfully"));
    } catch (error) {
      next(error);
    }
  };

  verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = validateVerifyEmailBody(req.body);
      if (!validation.valid) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json(
            createApiResponse(HttpStatus.BAD_REQUEST, validation.message || "Validation failed"),
          );
      }

      const { email } = req.body;
      await this._verifyEmailUsecase.execute(email);
      return res
        .status(HttpStatus.OK)
        .json(createApiResponse(HttpStatus.OK, ResponseMessage.PASSWORD_RESET_LINK_SENT));
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = validateResetPasswordBody(req.body);
      if (!validation.valid) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json(
            createApiResponse(HttpStatus.BAD_REQUEST, validation.message || "Validation failed"),
          );
      }

      const { token, password } = req.body;
      await this._resetPasswordUsecase.execute(token, password);
      return res
        .status(HttpStatus.OK)
        .json(createApiResponse(HttpStatus.OK, ResponseMessage.PASSWORD_RESET_SUCCESS));
    } catch (error) {
      next(error);
    }
  };

  googleLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = validateGoogleLoginBody(req.body);
      if (!validation.valid) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json(
            createApiResponse(HttpStatus.BAD_REQUEST, validation.message || "Validation failed"),
          );
      }

      const { token: googleToken } = req.body;

      const result = await this._googleLoginUsecase.execute(googleToken);

      const cookieOpts = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
      };

      res.cookie("token", result.token, { ...cookieOpts, maxAge: 15 * 60 * 1000 });
      res.cookie("refreshToken", result.refreshToken, {
        ...cookieOpts,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      const { refreshToken: _rt, ...safeResult } = result;
      void _rt;
      return res
        .status(HttpStatus.OK)
        .json(createApiResponse(HttpStatus.OK, "Google login successful", safeResult));
    } catch (error) {
      next(error);
    }
  };

  me = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const decodedUser = req.user;

      if (!decodedUser || !decodedUser.id) {
        return res
          .status(HttpStatus.UNAUTHORIZED)
          .json(createApiResponse(HttpStatus.UNAUTHORIZED, ResponseMessage.AUTH_REQUIRED));
      }

      const user = await this._getUserDetailsUseCase.execute(decodedUser.id);

      return res
        .status(HttpStatus.OK)
        .json(createApiResponse(HttpStatus.OK, "User details fetched successfully", { user }));
    } catch (error) {
      next(error);
    }
  };
}
