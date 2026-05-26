import { RiderStatus } from "../../../../domain/enums/UserRole.enum";

export interface UpdateProfileRequest {
  bio?: string;
  govId?: string;
  vehicleImage?: string;
  pucImage?: string;
  rcImage?: string;
}

export interface UpdateProfileResponse {
  message: string;
  isRiderActive: RiderStatus.PENDING;
}

export interface IUpdateProfileUseCase {
  execute(userId: string, profileData: UpdateProfileRequest): Promise<UpdateProfileResponse>;
}
