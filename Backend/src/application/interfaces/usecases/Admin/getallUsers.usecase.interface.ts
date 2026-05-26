export interface GetAllUsersResponse {
  id: string;
  name: string;
  email: string;
  phone: string;
  verified: boolean;
  blocked: boolean;
}

export interface PaginatedUsersResponse {
  data: GetAllUsersResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IGetAllUsersUseCase {
  execute(
    page: number,
    limit: number,
    search?: string,
    filter?: string,
  ): Promise<PaginatedUsersResponse>;
}
