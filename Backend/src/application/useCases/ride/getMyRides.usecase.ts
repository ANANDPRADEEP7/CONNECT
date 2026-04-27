import { IRideRepository } from "../../interfaces/repositories/Ride/IRideRepository";
import { Ride } from "../../../domain/entities/Ride/ride.entities";

/**
 * GetMyRidesUseCase – Application Layer
 * Returns all rides posted by a specific rider.
 */
export class GetMyRidesUseCase {
  constructor(private readonly rideRepository: IRideRepository) {}

  async execute(riderId: string): Promise<Ride[]> {
    return this.rideRepository.findByRider(riderId);
  }
}
