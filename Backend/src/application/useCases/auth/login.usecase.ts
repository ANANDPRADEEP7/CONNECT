import { IUserRepository } from "../../interfaces/repositories/User/IUserRepository";
import { ITokenService } from "../../../domain/interfaces/ITokenService";
import bcrypt from "bcrypt";

export class LoginUseCase {
    constructor(
        private userRepository: IUserRepository,
        private tokenService: ITokenService
    ) { }

    async execute(email: string, password: string) {
        // 1. Find user in MongoDB
        const user = await this.userRepository.findByEmailFromDB(email);
        if (!user) {
            throw new Error("User not found. Please sign up first.");
        }

        // 2. Check if blocked
        if (user.isBlocked) {
            throw new Error("Your account has been blocked. Contact support.");
        }

        // 3. Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error("Incorrect password. Please try again.");
        }

        // 4. Sign JWT using service
        const token = this.tokenService.generateAuthToken({ 
            id: user._id, 
            email: user.email, 
            role: user.role, 
            name: user.name 
        });

        return {
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        };
    }
}
