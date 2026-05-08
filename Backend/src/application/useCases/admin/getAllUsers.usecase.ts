import { IUserRepository } from "../../interfaces/repositories/User/IUserRepository";
import { IGetAllUsersUseCase } from "../../interfaces/usecases/Admin/getallUsers.usecase.interface";

export class GetAllUsersUseCase implements IGetAllUsersUseCase {
    constructor(private userRepository: IUserRepository) { }

    async execute() {
        const users = await this.userRepository.findAll();
        // Return all users except admins
        return users
            .filter(user => user.role !== "admin")
            .map(user => ({
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phonenumber || "N/A",
                verified: user.isVerified || false,
                blocked: user.isBlocked
            }));
    }
}
