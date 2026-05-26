import { IUserRepository } from "../../interfaces/repositories/User/IUserRepository";
import {
  IGetAllRidersUseCase,
  PaginatedRidersResponse,
} from "../../interfaces/usecases/Admin/getAllRiders.usecase.interface";

import { AdminRiderMapper } from "../../mappers/Admin/AdminRiderMapper";

export class GetAllRidersUseCase implements IGetAllRidersUseCase {
  constructor(private _userRepository: IUserRepository) {}

  async execute(
    page: number = 1,
    limit: number = 10,
    search?: string,
    filter?: string,
  ): Promise<PaginatedRidersResponse> {
    const { data: users, total } = await this._userRepository.findPaginatedRiders(
      page,
      limit,
      search,
      filter,
    );

    const mappedRiders = AdminRiderMapper.toAdminRiderDTOList(users);

    return {
      data: mappedRiders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
