import { IUserRepository } from "../../interfaces/repositories/User/IUserRepository";
import { ResponseMessage } from "../../../domain/enums/ResponseMessage.enum";
import { IUpdateRiderStatusUseCase } from "../../interfaces/usecases/Admin/updateRiderStatus.usecase.interface";

export class UpdateRiderStatusUseCase implements IUpdateRiderStatusUseCase {
    constructor(private userRepository: IUserRepository) { }

    async execute(userId: string, status: "active" | "declined") {
        const user = await this.userRepository.findById(userId);

        if (!user) {
            throw new Error(ResponseMessage.RIDER_NOT_FOUND);
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
            message: status === "active" ? ResponseMessage.RIDER_APPROVED : ResponseMessage.RIDER_REJECTED,
            isRiderActive: status,
            riderId: userId
        };
    }
}
