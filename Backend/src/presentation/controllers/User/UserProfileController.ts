import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "../../middleware/AuthMiddleware";
import { UpdateProfileUseCase } from "../../../application/useCases/user/updateProfile.usecase";
import { GetUserDetailsUseCase } from "../../../application/useCases/user/getUserDetails.usecase";
import { HttpStatus } from "../../../domain/enums/HttpStatus.enum";
import { ResponseMessage } from "../../../domain/enums/ResponseMessage.enum";

export class UserProfileController {
    constructor(
        private readonly updateProfileUseCase: UpdateProfileUseCase,
        private readonly getUserDetailsUseCase: GetUserDetailsUseCase
    ) { }

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
            const { userId, bio } = req.body;

            // Validate userId is present before doing anything
            if (!userId) {
                return res.status(HttpStatus.BAD_REQUEST).json({ message: "User ID is required" });
            }

            // Multer attaches uploaded files to req.files
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };

            // Build a URL-accessible path for each file: /uploads/<unique-filename>
            // This path is what gets stored in MongoDB
            const buildPath = (file: Express.Multer.File): string => `/uploads/${file.filename}`;

            const profileData: Partial<{
                bio: string;
                govId: string;
                vehicleImage: string;
                pucImage: string;
                rcImage: string;
            }> = { bio };

            if (files?.govId?.[0]) profileData.govId = buildPath(files.govId[0]);
            if (files?.vehicleImage?.[0]) profileData.vehicleImage = buildPath(files.vehicleImage[0]);
            if (files?.pucImage?.[0]) profileData.pucImage = buildPath(files.pucImage[0]);
            if (files?.rcImage?.[0]) profileData.rcImage = buildPath(files.rcImage[0]);

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
