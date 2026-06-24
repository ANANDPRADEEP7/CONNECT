export interface UpdatePersonalInfoRequest {
  name?: string;
  email?: string;
  phonenumber?: string;
}

export interface UpdatePersonalInfoResponse {
  message: string;
  name?: string;
  email?: string;
  phonenumber?: string;
}

export interface IUpdatePersonalInfoUseCase {
  execute(userId: string, data: UpdatePersonalInfoRequest): Promise<UpdatePersonalInfoResponse>;
}
