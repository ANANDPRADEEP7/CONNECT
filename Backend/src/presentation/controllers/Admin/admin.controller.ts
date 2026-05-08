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

export class AdminController {
  constructor(
    private readonly adminLoginUseCase: IAdminLoginUseCase,
    private readonly getAllUsersUseCase: IGetAllUsersUseCase,
    private readonly toggleBlockUserUseCase: IToggleBlockUserUseCase,
    private readonly getAllRidersUseCase: IGetAllRidersUseCase,
    private readonly updateRiderStatusUseCase: IUpdateRiderStatusUseCase,
    private readonly getUserDetailsUseCase: IGetUserDetailsUseCase
  ) {}

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const result = await this.adminLoginUseCase.execute(email, password);

      res.cookie("adminToken", result.token, {
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

  logout = async (req: Request, res: Response) => {
    res.clearCookie("adminToken");
    return res.status(HttpStatus.OK).json({ message: ResponseMessage.LOGOUT_SUCCESS });
  };

  me = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const decodedAdmin = req.user;
      if (!decodedAdmin || decodedAdmin.role !== "admin") {
        return res.status(HttpStatus.UNAUTHORIZED).json({ message: "Not authenticated as admin" });
      }

      const admin = await this.getUserDetailsUseCase.execute(decodedAdmin.id);
      return res.status(HttpStatus.OK).json({ admin });
    } catch (error) {
      next(error);
    }
  };

  getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await this.getAllUsersUseCase.execute();
      return res.status(HttpStatus.OK).json(users);
    } catch (error) {
      next(error);
    }
  };

  toggleBlockUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const result = await this.toggleBlockUserUseCase.execute(id as string);
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  getAllRiders = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const riders = await this.getAllRidersUseCase.execute();
      return res.status(HttpStatus.OK).json(riders);
    } catch (error) {
      next(error);
    }
  };

  updateRiderStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { status } = req.body; // "active" or "declined"
      const result = await this.updateRiderStatusUseCase.execute(id as string, status);
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      next(error);
    }
  };
}
