import { IUserRepository } from "../../interfaces/repositories/User/IUserRepository";
import { IGetAllUsersUseCase } from "../../interfaces/usecases/Admin/getallUsers.usecase.interface";

export class GetAllUsersUseCase implements IGetAllUsersUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(page: number = 1, limit: number = 10) {
    const { data: users, total } = await this.userRepository.findPaginatedUsers(page, limit);
    
    const mappedUsers = users.map((user) => ({
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phonenumber || "N/A",
      verified: user.isVerified || false,
      blocked: user.isBlocked,
    }));

    return {
      data: mappedUsers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }
}
