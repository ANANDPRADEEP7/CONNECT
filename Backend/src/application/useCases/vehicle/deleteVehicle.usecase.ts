import { IVehicleRepository } from "../../interfaces/repositories/Vehicle/IVehicleRepository";

export class DeleteVehicleUseCase {
  constructor(private readonly _vehicleRepository: IVehicleRepository) {}

  async execute(id: string, riderId: string): Promise<void> {
    const existing = await this._vehicleRepository.findById(id);
    if (!existing) throw new Error("Vehicle not found");
    if (existing.riderId.toString() !== riderId) {
      throw new Error("Not authorized to delete this vehicle");
    }

    // Optionally check if the vehicle is currently being used in any active rides
    // This requires a Ride repository check. (We can skip this for now or add a comment).

    await this._vehicleRepository.delete(id);
  }
}
