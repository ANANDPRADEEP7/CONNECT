import { IUserRepository } from "../../interfaces/repositories/User/IUserRepository";
import {
  GetAllRidersResponse,
  IGetAllRidersUseCase,
  PaginatedRidersResponse,
} from "../../interfaces/usecases/Admin/getAllRiders.usecase.interface";

export class GetAllRidersUseCase implements IGetAllRidersUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(page: number = 1, limit: number = 10): Promise<PaginatedRidersResponse> {
    const { data: users, total } = await this.userRepository.findPaginatedRiders(page, limit);
    
    const mappedRiders = users.map((user) => ({
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phonenumber || "N/A",
      status:
        user.isRiderActive === "active"
          ? "approved"
          : user.isRiderActive === "declined"
            ? "rejected"
            : "pending",
      bio: user.bio,
      govId: user.govId,
      vehicleImage: user.vehicleImage,
      pucImage: user.pucImage,
      rcImage: user.rcImage,
    })) as GetAllRidersResponse[];

    return {
      data: mappedRiders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }
}
