import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "../../middleware/AuthMiddleware";
import { AdminLoginUseCase } from "../../../application/useCases/admin/adminLogin.usecase";
import { GetAllUsersUseCase } from "../../../application/useCases/admin/getAllUsers.usecase";
import { ToggleBlockUserUseCase } from "../../../application/useCases/admin/toggleBlockUser.usecase";
import { GetAllRidersUseCase } from "../../../application/useCases/admin/getAllRiders.usecase";
import { UpdateRiderStatusUseCase } from "../../../application/useCases/admin/updateRiderStatus.usecase";
import { GetUserDetailsUseCase } from "../../../application/useCases/user/getUserDetails.usecase";
import { HttpStatus } from "../../../domain/enums/HttpStatus.enum";
import { ResponseMessage } from "../../../domain/enums/ResponseMessage.enum";

export class AdminController {
  constructor(
    private readonly adminLoginUseCase: AdminLoginUseCase,
    private readonly getAllUsersUseCase: GetAllUsersUseCase,
    private readonly toggleBlockUserUseCase: ToggleBlockUserUseCase,
    private readonly getAllRidersUseCase: GetAllRidersUseCase,
    private readonly updateRiderStatusUseCase: UpdateRiderStatusUseCase,
    private readonly getUserDetailsUseCase: GetUserDetailsUseCase
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
