import { IVehicleRepository } from "../../interfaces/repositories/Vehicle/IVehicleRepository";
import { VehicleDTO, VehicleMapper } from "../../mappers/Vehicle/VehicleMapper";

export class GetMyVehiclesUseCase {
  constructor(private readonly _vehicleRepository: IVehicleRepository) {}

  async execute(riderId: string): Promise<VehicleDTO[]> {
    const vehicles = await this._vehicleRepository.findByRider(riderId);
    return VehicleMapper.toVehicleDTOList(vehicles);
  }
}
