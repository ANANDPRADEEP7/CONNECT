import { Request, Response } from "express";
import { AdminLoginUseCase } from "../../../application/useCases/admin/adminLogin.usecase";
import { GetAllUsersUseCase } from "../../../application/useCases/admin/getAllUsers.usecase";
import { ToggleBlockUserUseCase } from "../../../application/useCases/admin/toggleBlockUser.usecase";
import { GetAllRidersUseCase } from "../../../application/useCases/admin/getAllRiders.usecase";
import { UpdateRiderStatusUseCase } from "../../../application/useCases/admin/updateRiderStatus.usecase";
import { GetUserDetailsUseCase } from "../../../application/useCases/user/getUserDetails.usecase";

export class AdminController {
  constructor(
    private readonly adminLoginUseCase: AdminLoginUseCase,
    private readonly getAllUsersUseCase: GetAllUsersUseCase,
    private readonly toggleBlockUserUseCase: ToggleBlockUserUseCase,
    private readonly getAllRidersUseCase: GetAllRidersUseCase,
    private readonly updateRiderStatusUseCase: UpdateRiderStatusUseCase,
    private readonly getUserDetailsUseCase: GetUserDetailsUseCase
  ) {}

  login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const result = await this.adminLoginUseCase.execute(email, password);

      res.cookie("adminToken", result.token, {
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

  logout = async (req: Request, res: Response) => {
    res.clearCookie("adminToken");
    return res.status(200).json({ message: "Admin logged out successfully" });
  };

  me = async (req: Request, res: Response) => {
    try {
      const decodedAdmin = (req as any).user;
      if (!decodedAdmin || decodedAdmin.role !== "admin") {
        return res.status(401).json({ message: "Not authenticated as admin" });
      }
      
      const admin = await this.getUserDetailsUseCase.execute(decodedAdmin.id);
      return res.status(200).json({ admin });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  getAllUsers = async (req: Request, res: Response) => {
    try {
      const users = await this.getAllUsersUseCase.execute();
      return res.status(200).json(users);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  toggleBlockUser = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const result = await this.toggleBlockUserUseCase.execute(id as string);
      return res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  getAllRiders = async (req: Request, res: Response) => {
    try {
      const riders = await this.getAllRidersUseCase.execute();
      return res.status(200).json(riders);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  updateRiderStatus = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body; // "active" or "declined"
      const result = await this.updateRiderStatusUseCase.execute(id as string, status);
      return res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };
}
