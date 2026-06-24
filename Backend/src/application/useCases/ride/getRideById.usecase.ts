import { IRideRepository } from "../../interfaces/repositories/Ride/IRideRepository";
import { Ride } from "../../../domain/entities/Ride/ride.entities";

export class GetRideByIdUseCase {
  constructor(private readonly _rideRepository: IRideRepository) {}

  async execute(id: string): Promise<Ride | null> {
    return this._rideRepository.findById(id);
  }
}
