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

export interface PaginatedRidersResponse {
  data: GetAllRidersResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IGetAllRidersUseCase {
  execute(
    page: number,
    limit: number,
    search?: string,
    filter?: string,
  ): Promise<PaginatedRidersResponse>;
}
