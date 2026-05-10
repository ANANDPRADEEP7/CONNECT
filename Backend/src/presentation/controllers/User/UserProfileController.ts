import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "../../middleware/AuthMiddleware";
import { UpdateProfileUseCase } from "../../../application/useCases/user/updateProfile.usecase";
import { GetUserDetailsUseCase } from "../../../application/useCases/user/getUserDetails.usecase";
import { HttpStatus } from "../../../domain/enums/HttpStatus.enum";
import { ResponseMessage } from "../../../domain/enums/ResponseMessage.enum";
import { IUpdateProfileUseCase } from "../../../application/interfaces/usecases/User/updateProfile.usecase.interface";
import { IGetUserDetailsUseCase } from "../../../application/interfaces/usecases/Auth/getuserDetails.usecase.interface";
import { validateUpdateProfileBody } from "../../validationSchemas/userProfile.validation";

export class UserProfileController {
  constructor(
    private readonly updateProfileUseCase: IUpdateProfileUseCase,
    private readonly getUserDetailsUseCase: IGetUserDetailsUseCase,
  ) {}

  getUserDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const user = await this.getUserDetailsUseCase.execute(userId as string);
      return res.status(HttpStatus.OK).json(user);
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Files are uploaded to Cloudinary on the frontend.
      // The frontend sends Cloudinary secure_url strings in the JSON body.
      const validation = validateUpdateProfileBody(req.body);
      if (!validation.valid) {
        return res.status(HttpStatus.BAD_REQUEST).json({ message: validation.message });
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

      // Use case: updates user in DB and sets isRiderActive = "pending"
      await this.updateProfileUseCase.execute(userId, profileData);

      return res.status(HttpStatus.OK).json({
        message: ResponseMessage.PROFILE_PENDING_REVIEW,
      });
    } catch (error) {
      next(error);
    }
  };
}
