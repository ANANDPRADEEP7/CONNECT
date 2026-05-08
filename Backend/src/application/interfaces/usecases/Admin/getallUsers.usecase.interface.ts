export interface GetAllUsersResponse {
  id: string;
  name: string;
  email: string;
  phone: string;
  verified: boolean;
  blocked: boolean;
}

export interface IGetAllUsersUseCase {
  execute(): Promise<GetAllUsersResponse[]>;
}