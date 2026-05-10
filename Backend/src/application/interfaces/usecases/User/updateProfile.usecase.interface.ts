export interface UpdateProfileRequest {
  bio?: string;
  govId?: string;
  vehicleImage?: string;
  pucImage?: string;
  rcImage?: string;
}

export interface UpdateProfileResponse {
  message: string;
  isRiderActive: "pending";
}

export interface IUpdateProfileUseCase {
  execute(userId: string, profileData: UpdateProfileRequest): Promise<UpdateProfileResponse>;
}
