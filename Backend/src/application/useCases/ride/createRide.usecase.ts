import { IRideRepository } from "../../interfaces/repositories/Ride/IRideRepository";
import { Ride } from "../../../domain/entities/Ride/ride.entities";

/**
 * CreateRideUseCase – Application Layer
 * Handles validation and creation of a new ride posting.
 */
export class CreateRideUseCase {
  constructor(private readonly rideRepository: IRideRepository) {}

  async execute(
    riderId: string,
    data: {
      from: string;
      to: string;
      date: string;
      time: string;
      seats: number;
      pricePerSeat: number;
      description?: string;
    }
  ): Promise<Ride> {
    if (!data.from || !data.to) {
      throw new Error("Starting location and destination are required.");
    }
    if (!data.date || !data.time) {
      throw new Error("Date and time are required.");
    }
    if (!data.seats || data.seats < 1 || data.seats > 8) {
      throw new Error("Seats must be between 1 and 8.");
    }
    if (data.pricePerSeat < 0) {
      throw new Error("Price per seat cannot be negative.");
    }

    return this.rideRepository.create({
      riderId,
      from: data.from.trim(),
      to: data.to.trim(),
      date: data.date,
      time: data.time,
      seats: data.seats,
      pricePerSeat: data.pricePerSeat,
      description: data.description?.trim(),
      status: "active",
    });
  }
}
