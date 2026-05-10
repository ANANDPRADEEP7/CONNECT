import { IRideRepository } from "../../interfaces/repositories/Ride/IRideRepository";
import {
  CreateRideRequest,
  CreateRideResponse,
  ICreateRideUseCase,
} from "../../interfaces/usecases/Rider/createRide.usecase.interface";

export class CreateRideUseCase implements ICreateRideUseCase {
  constructor(private readonly rideRepository: IRideRepository) {}

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

    const ride = await this.rideRepository.create({
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
      ride: {
        id: ride._id.toString(),
        riderId: ride.riderId.toString(),
        from: ride.from,
        to: ride.to,
        date: ride.date,
        time: ride.time,
        seats: ride.seats,
        pricePerSeat: ride.pricePerSeat,
        description: ride.description,
        status: ride.status,
        createdAt: ride.createdAt,
        updatedAt: ride.updatedAt,
      },
    };
  }
}
