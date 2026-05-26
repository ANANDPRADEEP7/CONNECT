import { IRideRepository } from "../../interfaces/repositories/Ride/IRideRepository";
import {
  CreateRideRequest,
  CreateRideResponse,
  ICreateRideUseCase,
} from "../../interfaces/usecases/Rider/createRide.usecase.interface";
import { RideMapper } from "../../mappers/Ride/RideMapper";

export class CreateRideUseCase implements ICreateRideUseCase {
  constructor(private readonly _rideRepository: IRideRepository) {}

  async execute(riderId: string, data: CreateRideRequest): Promise<CreateRideResponse> {
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

    const ride = await this._rideRepository.create({
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

    return {
      message: "Ride posted successfully!",
      ride: RideMapper.toRideDTO(ride),
    };
  }
}
