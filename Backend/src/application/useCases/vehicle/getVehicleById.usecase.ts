import { IVehicleRepository } from "../../interfaces/repositories/Vehicle/IVehicleRepository";
import { VehicleDTO, VehicleMapper } from "../../mappers/Vehicle/VehicleMapper";

export class GetVehicleByIdUseCase {
  constructor(private readonly _vehicleRepository: IVehicleRepository) {}

  async execute(id: string): Promise<VehicleDTO | null> {
    const vehicle = await this._vehicleRepository.findById(id);
    return vehicle ? VehicleMapper.toVehicleDTO(vehicle) : null;
  }
}
