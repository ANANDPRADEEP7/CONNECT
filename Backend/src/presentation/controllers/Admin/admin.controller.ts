import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "../../middleware/AuthMiddleware";
import { HttpStatus } from "../../../domain/enums/HttpStatus.enum";
import { ResponseMessage } from "../../../domain/enums/ResponseMessage.enum";
import { IAdminLoginUseCase } from "../../../application/interfaces/usecases/Admin/adminLogin.usecase.interface";
import { IGetAllUsersUseCase } from "../../../application/interfaces/usecases/Admin/getallUsers.usecase.interface";
import { IToggleBlockUserUseCase } from "../../../application/interfaces/usecases/Admin/toggleBlockUser.usecase.interface";
import { IGetAllRidersUseCase } from "../../../application/interfaces/usecases/Admin/getAllRiders.usecase.interface";
import { IUpdateRiderStatusUseCase } from "../../../application/interfaces/usecases/Admin/updateRiderStatus.usecase.interface";
import { IGetUserDetailsUseCase } from "../../../application/interfaces/usecases/Auth/getuserDetails.usecase.interface";
import { validateLoginBody } from "../../validationSchemas/auth.validation";
import { validateUpdateRiderStatusBody } from "../../validationSchemas/admin.validation";
import { UserRole } from "../../../domain/enums/UserRole.enum";
import { createApiResponse } from "../../utils/apiResponse";

export class AdminController {
  constructor(
    private readonly _adminLoginUseCase: IAdminLoginUseCase,
    private readonly _getAllUsersUseCase: IGetAllUsersUseCase,
    private readonly _toggleBlockUserUseCase: IToggleBlockUserUseCase,
    private readonly _getAllRidersUseCase: IGetAllRidersUseCase,
    private readonly _updateRiderStatusUseCase: IUpdateRiderStatusUseCase,
    private readonly _getUserDetailsUseCase: IGetUserDetailsUseCase,
  ) {}

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
      const result = await this._adminLoginUseCase.execute(email, password);

      const cookieOpts = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
      };

      res.cookie("adminToken", result.token, { ...cookieOpts, maxAge: 15 * 60 * 1000 });
      res.cookie("adminRefreshToken", result.refreshToken, {
        ...cookieOpts,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      const { refreshToken: _rt, ...safeResult } = result;
      void _rt;
      return res
        .status(HttpStatus.OK)
        .json(createApiResponse(HttpStatus.OK, "Admin logged in successfully", safeResult));
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response) => {
    res.clearCookie("adminToken");
    res.clearCookie("adminRefreshToken");
    return res
      .status(HttpStatus.OK)
      .json(createApiResponse(HttpStatus.OK, ResponseMessage.LOGOUT_SUCCESS));
  };

  me = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const decodedAdmin = req.user;
      if (!decodedAdmin || decodedAdmin.role !== UserRole.ADMIN) {
        return res
          .status(HttpStatus.UNAUTHORIZED)
          .json(createApiResponse(HttpStatus.UNAUTHORIZED, "Not authenticated as admin"));
      }

      const admin = await this._getUserDetailsUseCase.execute(decodedAdmin.id);
      return res
        .status(HttpStatus.OK)
        .json(createApiResponse(HttpStatus.OK, "Admin details fetched successfully", { admin }));
    } catch (error) {
      next(error);
    }
  };

  getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string | undefined;
      const filter = req.query.filter as string | undefined;
      const users = await this._getAllUsersUseCase.execute(page, limit, search, filter);
      return res
        .status(HttpStatus.OK)
        .json(createApiResponse(HttpStatus.OK, "Users list fetched successfully", users));
    } catch (error) {
      next(error);
    }
  };

  toggleBlockUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const result = await this._toggleBlockUserUseCase.execute(id as string);
      return res
        .status(HttpStatus.OK)
        .json(createApiResponse(HttpStatus.OK, result.message, result));
    } catch (error) {
      next(error);
    }
  };

  getAllRiders = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string | undefined;
      const filter = req.query.filter as string | undefined;
      const riders = await this._getAllRidersUseCase.execute(page, limit, search, filter);
      return res
        .status(HttpStatus.OK)
        .json(createApiResponse(HttpStatus.OK, "Riders list fetched successfully", riders));
    } catch (error) {
      next(error);
    }
  };

  updateRiderStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = validateUpdateRiderStatusBody(req.body);
      if (!validation.valid) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json(
            createApiResponse(HttpStatus.BAD_REQUEST, validation.message || "Validation failed"),
          );
      }

      const { id } = req.params;
      const { status, rejectionReason } = req.body;
      const result = await this._updateRiderStatusUseCase.execute(
        id as string,
        status,
        rejectionReason,
      );
      return res
        .status(HttpStatus.OK)
        .json(createApiResponse(HttpStatus.OK, result.message, result));
    } catch (error) {
      next(error);
    }
  };
}
