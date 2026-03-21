import { IUserRepository } from "../../interfaces/repositories/User/IUserRepository";
import { ITokenService } from "../../../domain/interfaces/ITokenService";
import bcrypt from "bcrypt";

export class AdminLoginUseCase {
    constructor(
        private userRepository: IUserRepository,
        private tokenService: ITokenService
    ) { }

    async execute(email: string, password: string) {
        // 1. Find user in MongoDB
        const user = await this.userRepository.findByEmailFromDB(email);
        if (!user) {
            throw new Error("Admin not found.");
        }

        // 2. Check if admin
        if (user.role !== "admin") {
            throw new Error("Access denied. You are not an admin.");
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
            message: "Admin login successful",
            token,
            admin: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        };
    }
}
