import { IUserRepository } from "../../interfaces/repositories/User/IUserRepository";

export class GetAllRidersUseCase {
    constructor(private userRepository: IUserRepository) { }

    async execute() {
        const users = await this.userRepository.findAll();
        // Return any user who has submitted rider details (isRiderActive !== "none")
        return users
            .filter(user => user.isRiderActive && user.isRiderActive !== "none")
            .map(user => ({
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phonenumber || "N/A",
                status: user.isRiderActive === "active" ? "approved" : 
                        user.isRiderActive === "declined" ? "rejected" : "pending",
                bio: user.bio,
                govId: user.govId,
                vehicleImage: user.vehicleImage,
                pucImage: user.pucImage,
                rcImage: user.rcImage
            }));
    }
}
