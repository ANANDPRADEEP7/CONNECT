import { IUserRepository } from "../../interfaces/repositories/User/IUserRepository";

export class GetUserDetailsUseCase {
    constructor(private readonly userRepository: IUserRepository) {}

    async execute(userId: string) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }
        return {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isRiderActive: user.isRiderActive,
            isBlocked: user.isBlocked
        };
    }
}
