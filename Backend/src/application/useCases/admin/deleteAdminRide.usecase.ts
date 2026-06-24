import { IRideRepository } from "../../interfaces/repositories/Ride/IRideRepository";
import { IDeleteAdminRideUseCase } from "../../interfaces/usecases/Admin/deleteAdminRide.usecase.interface";

export class DeleteAdminRideUseCase implements IDeleteAdminRideUseCase {
  constructor(private readonly _rideRepository: IRideRepository) {}

  async execute(id: string): Promise<void> {
    await this._rideRepository.delete(id);
  }
}
