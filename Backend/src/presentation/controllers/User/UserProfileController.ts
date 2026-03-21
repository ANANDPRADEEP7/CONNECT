import { Request, Response } from "express";
import { UpdateProfileUseCase } from "../../../application/useCases/user/updateProfile.usecase";
import { GetUserDetailsUseCase } from "../../../application/useCases/user/getUserDetails.usecase";

export class UserProfileController {
    constructor(
        private readonly updateProfileUseCase: UpdateProfileUseCase,
        private readonly getUserDetailsUseCase: GetUserDetailsUseCase
    ) { }

    getUserDetails = async (req: Request, res: Response) => {
        try {
            const { userId } = req.params;
            const user = await this.getUserDetailsUseCase.execute(userId as string);
            return res.status(200).json(user);
        } catch (error: any) {
            return res.status(404).json({ message: error.message });
        }
    };

    updateProfile = async (req: Request, res: Response) => {
        try {
            const { userId, bio } = req.body;

            // Validate userId is present before doing anything
            if (!userId) {
                return res.status(400).json({ message: "User ID is required" });
            }

            // Multer attaches uploaded files to req.files
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };

            // Build a URL-accessible path for each file: /uploads/<unique-filename>
            // This path is what gets stored in MongoDB
            const buildPath = (file: Express.Multer.File): string => `/uploads/${file.filename}`;

            const profileData: Record<string, any> = { bio };

            if (files?.govId?.[0]) profileData.govId = buildPath(files.govId[0]);
            if (files?.vehicleImage?.[0]) profileData.vehicleImage = buildPath(files.vehicleImage[0]);
            if (files?.pucImage?.[0]) profileData.pucImage = buildPath(files.pucImage[0]);
            if (files?.rcImage?.[0]) profileData.rcImage = buildPath(files.rcImage[0]);

            // Use case: updates user in DB and sets isRiderActive = "pending"
            await this.updateProfileUseCase.execute(userId, profileData);

            return res.status(200).json({
                message: "Profile updated successfully. Status set to pending review.",
            });
        } catch (error: any) {
            return res.status(500).json({ message: error.message });
        }
    };
}
