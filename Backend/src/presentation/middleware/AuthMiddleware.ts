import { ITokenService, TokenPayload } from "../../domain/interfaces/ITokenService";
import { HttpStatus } from "../../domain/enums/HttpStatus.enum";
import { ResponseMessage } from "../../domain/enums/ResponseMessage.enum";
import { NextFunction, Request, Response } from "express";

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

export const authenticateUser = (tokenService: ITokenService) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.cookies.token;

    if (!token) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ message: ResponseMessage.AUTH_REQUIRED });
    }

    const decoded = tokenService.verifyToken(token);
    if (!decoded) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ message: "Token is not valid" });
    }

    req.user = decoded;
    next();
  };
};

export const authenticateAdmin = (tokenService: ITokenService) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.cookies.adminToken;

    if (!token) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ message: "No admin token, authorization denied" });
    }

    const decoded = tokenService.verifyToken(token);
    if (!decoded) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ message: "Token is not valid" });
    }

    if (decoded.role !== "admin") {
      return res.status(HttpStatus.FORBIDDEN).json({ message: ResponseMessage.NOT_AUTHORIZED });
    }

    req.user = decoded;
    next();
  };
};
