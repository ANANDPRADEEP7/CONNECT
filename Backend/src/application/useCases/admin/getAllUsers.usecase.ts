import { IUserRepository } from "../../interfaces/repositories/User/IUserRepository";
import { IGetAllUsersUseCase } from "../../interfaces/usecases/Admin/getallUsers.usecase.interface";

import { AdminUserMapper } from "../../mappers/Admin/AdminUserMapper";

export class GetAllUsersUseCase implements IGetAllUsersUseCase {
  constructor(private _userRepository: IUserRepository) {}

  async execute(page: number = 1, limit: number = 10, search?: string, filter?: string) {
    const { data: users, total } = await this._userRepository.findPaginatedUsers(
      page,
      limit,
      search,
      filter,
    );

    const mappedUsers = AdminUserMapper.toAdminUserDTOList(users);

    return {
      data: mappedUsers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
