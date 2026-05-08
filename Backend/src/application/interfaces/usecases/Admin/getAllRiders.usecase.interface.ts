export interface GetAllRidersResponse {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: "approved" | "rejected" | "pending";
  bio?: string;
  govId?: string;
  vehicleImage?: string;
  pucImage?: string;
  rcImage?: string;
}

export interface IGetAllRidersUseCase {
  execute(): Promise<GetAllRidersResponse[]>;
}