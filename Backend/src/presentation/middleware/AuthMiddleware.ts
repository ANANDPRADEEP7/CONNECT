import { Request, Response, NextFunction } from "express";
import { ITokenService } from "../../domain/interfaces/ITokenService";

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticateUser = (tokenService: ITokenService) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    const decoded = tokenService.verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: "Token is not valid" });
    }

    req.user = decoded;
    next();
  };
};

export const authenticateAdmin = (tokenService: ITokenService) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.cookies.adminToken;

    if (!token) {
      return res.status(401).json({ message: "No admin token, authorization denied" });
    }

    const decoded = tokenService.verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: "Token is not valid" });
    }

    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Access denied: Admins only" });
    }

    req.user = decoded;
    next();
  };
};
