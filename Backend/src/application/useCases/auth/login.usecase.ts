import { IUserRepository } from "../../interfaces/repositories/User/IUserRepository";
import { ITokenService } from "../../../domain/interfaces/ITokenService";
import bcrypt from "bcrypt";
import { ResponseMessage } from "../../../domain/enums/ResponseMessage.enum";

export class LoginUseCase {
    constructor(
        private userRepository: IUserRepository,
        private tokenService: ITokenService
    ) { }

    async execute(email: string, password: string) {
        // 1. Find user in MongoDB
        const user = await this.userRepository.findByEmailFromDB(email);
        if (!user) {
            throw new Error(ResponseMessage.USER_NOT_FOUND);
        }

        // 2. Check if blocked
        if (user.isBlocked) {
            throw new Error(ResponseMessage.USER_BLOCKED);
        }

        // 3. Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error(ResponseMessage.INCORRECT_PASSWORD);
        }

        // 4. Sign JWT using service
        const token = this.tokenService.generateAuthToken({
            id: user._id,
            email: user.email,
            role: user.role,
            name: user.name
        });

        return {
            message: ResponseMessage.LOGIN_SUCCESS,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isRiderActive: user.isRiderActive,
                isBlocked: user.isBlocked,
                phonenumber: user.phonenumber,
                bio: user.bio,
                govId: user.govId,
                vehicleImage: user.vehicleImage,
                pucImage: user.pucImage,
                rcImage: user.rcImage
            },
        };
    }
}

