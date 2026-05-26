import { RiderStatus } from "../../../../domain/enums/UserRole.enum";

export interface UpdateRiderStatusResponse {
  message: string;
  isRiderActive: RiderStatus.ACTIVE | RiderStatus.DECLINED;
  riderId: string;
}

export interface IUpdateRiderStatusUseCase {
  execute(
    userId: string,
    status: RiderStatus.ACTIVE | RiderStatus.DECLINED,
    rejectionReason?: string,
  ): Promise<UpdateRiderStatusResponse>;
}
