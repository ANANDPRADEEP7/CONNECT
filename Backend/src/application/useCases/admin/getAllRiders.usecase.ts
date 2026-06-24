import { IUserRepository } from "../../interfaces/repositories/User/IUserRepository";
import { IVehicleRepository } from "../../interfaces/repositories/Vehicle/IVehicleRepository";
import {
  IGetAllRidersUseCase,
  PaginatedRidersResponse,
} from "../../interfaces/usecases/Admin/getAllRiders.usecase.interface";

import { AdminRiderMapper } from "../../mappers/Admin/AdminRiderMapper";

export class GetAllRidersUseCase implements IGetAllRidersUseCase {
  constructor(
    private _userRepository: IUserRepository,
    private _vehicleRepository: IVehicleRepository,
  ) {}

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

    const mappedRiders = [];
    for (const user of users) {
      const vehicles = await this._vehicleRepository.findByRider(user._id.toString());
      mappedRiders.push(AdminRiderMapper.toAdminRiderDTO(user, vehicles));
    }

    return {
      data: mappedRiders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
