import { IRideRepository } from "../../interfaces/repositories/Ride/IRideRepository";
import { Ride } from "../../../domain/entities/Ride/ride.entities";

/**
 * GetRidesUseCase – Application Layer
 * Fetches all active rides (public search / browse).
 */
export class GetRidesUseCase {
  constructor(private readonly rideRepository: IRideRepository) {}

  async execute(): Promise<Ride[]> {
    return this.rideRepository.findAll({ status: "active" });
  }
}
