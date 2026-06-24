import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "../../middleware/AuthMiddleware";
import { HttpStatus } from "../../../domain/enums/HttpStatus.enum";
import { ResponseMessage } from "../../../domain/enums/ResponseMessage.enum";
import { IUpdateProfileUseCase } from "../../../application/interfaces/usecases/User/updateProfile.usecase.interface";
import { IUpdatePersonalInfoUseCase } from "../../../application/interfaces/usecases/User/updatePersonalInfo.usecase.interface";
import { IGetUserDetailsUseCase } from "../../../application/interfaces/usecases/Auth/getuserDetails.usecase.interface";
import {
  validateUpdateProfileBody,
  validateUpdatePersonalInfoBody,
} from "../../validationSchemas/userProfile.validation";
import { createApiResponse } from "../../utils/apiResponse";

export class UserProfileController {
  constructor(
    private readonly _updateProfileUseCase: IUpdateProfileUseCase,
    private readonly _getUserDetailsUseCase: IGetUserDetailsUseCase,
    private readonly _updatePersonalInfoUseCase: IUpdatePersonalInfoUseCase,
  ) {}

  getUserDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const user = await this._getUserDetailsUseCase.execute(userId as string);
      return res
        .status(HttpStatus.OK)
        .json(createApiResponse(HttpStatus.OK, "User details fetched successfully", user));
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const validation = validateUpdateProfileBody(req.body);
      if (!validation.valid) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json(
            createApiResponse(HttpStatus.BAD_REQUEST, validation.message || "Validation failed"),
          );
      }

      const { userId, bio, govId, vehicleImage, pucImage, rcImage } = req.body;

      const profileData: Partial<{
        bio: string;
        govId: string;
        vehicleImage: string;
        pucImage: string;
        rcImage: string;
      }> = {};

      if (bio !== undefined) profileData.bio = bio;
      if (govId) profileData.govId = govId;
      if (vehicleImage) profileData.vehicleImage = vehicleImage;
      if (pucImage) profileData.pucImage = pucImage;
      if (rcImage) profileData.rcImage = rcImage;

      await this._updateProfileUseCase.execute(userId, profileData);

      return res
        .status(HttpStatus.OK)
        .json(createApiResponse(HttpStatus.OK, ResponseMessage.PROFILE_PENDING_REVIEW));
    } catch (error) {
      next(error);
    }
  };

  updatePersonalInfo = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const validation = validateUpdatePersonalInfoBody(req.body);
      if (!validation.valid) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json(
            createApiResponse(HttpStatus.BAD_REQUEST, validation.message || "Validation failed"),
          );
      }

      const userId = req.user?.id;
      if (!userId) {
        return res
          .status(HttpStatus.UNAUTHORIZED)
          .json(createApiResponse(HttpStatus.UNAUTHORIZED, "Unauthorized"));
      }

      const { name, email, phonenumber } = req.body as {
        name?: string;
        email?: string;
        phonenumber?: string;
      };

      const result = await this._updatePersonalInfoUseCase.execute(userId, {
        name,
        email,
        phonenumber,
      });

      return res
        .status(HttpStatus.OK)
        .json(createApiResponse(HttpStatus.OK, result.message, result));
    } catch (error) {
      next(error);
    }
  };
}
