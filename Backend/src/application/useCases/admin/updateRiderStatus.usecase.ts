import { IUserRepository } from "../../interfaces/repositories/User/IUserRepository";

export class UpdateRiderStatusUseCase {
    constructor(private userRepository: IUserRepository) { }

    async execute(userId: string, status: "active" | "declined") {
        const user = await this.userRepository.findById(userId);

        if (!user) {
            throw new Error("Rider not found");
        }

        const updateData: any = { isRiderActive: status };
        
        // If approved, also upgrade role to 'rider'
        if (status === "active") {
            updateData.role = "rider";
        } else if (status === "declined") {
            updateData.role = "user";
        }

        await this.userRepository.update(userId, updateData);

        return {
            message: `Rider ${status === "active" ? "approved" : "rejected"} successfully`,
            isRiderActive: status
        };
    }
}
