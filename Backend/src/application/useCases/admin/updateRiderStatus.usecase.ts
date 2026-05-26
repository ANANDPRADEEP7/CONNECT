import { IUserRepository } from "../../interfaces/repositories/User/IUserRepository";
import { ResponseMessage } from "../../../domain/enums/ResponseMessage.enum";
import { IUpdateRiderStatusUseCase } from "../../interfaces/usecases/Admin/updateRiderStatus.usecase.interface";
import { UserRole, RiderStatus } from "../../../domain/enums/UserRole.enum";

export class UpdateRiderStatusUseCase implements IUpdateRiderStatusUseCase {
  constructor(private _userRepository: IUserRepository) {}

  async execute(
    userId: string,
    status: RiderStatus.ACTIVE | RiderStatus.DECLINED,
    rejectionReason?: string,
  ) {
    const user = await this._userRepository.findById(userId);

    if (!user) {
      throw new Error(ResponseMessage.RIDER_NOT_FOUND);
    }

    if (user.isRiderActive === RiderStatus.ACTIVE || user.isRiderActive === RiderStatus.DECLINED) {
      throw new Error("Rider status has already been finalized and cannot be changed.");
    }

    const updateData: Record<string, unknown> = { isRiderActive: status };

    if (status === RiderStatus.ACTIVE) {
      updateData.role = UserRole.RIDER;
      updateData.rejectionReason = null;
    } else if (status === RiderStatus.DECLINED) {
      updateData.role = UserRole.USER;
      updateData.rejectionReason = rejectionReason || "No reason provided.";
    }

    await this._userRepository.update(userId, updateData);

    return {
      message:
        status === RiderStatus.ACTIVE
          ? ResponseMessage.RIDER_APPROVED
          : ResponseMessage.RIDER_REJECTED,
      isRiderActive: status,
      riderId: userId,
    };
  }
}
