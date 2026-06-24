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

    if (
      typeof data.from.latitude !== "number" ||
      typeof data.from.longitude !== "number" ||
      !data.from.name
    ) {
      throw new Error("Starting location must be a valid coordinate with name, latitude, and longitude.");
    }

    if (
      typeof data.to.latitude !== "number" ||
      typeof data.to.longitude !== "number" ||
      !data.to.name
    ) {
      throw new Error("Destination must be a valid coordinate with name, latitude, and longitude.");
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
      from: data.from,
      to: data.to,
      date: data.date,
      time: data.time,
      seats: data.seats,
      pricePerSeat: data.pricePerSeat,
      description: data.description?.trim(),
      vehicleId: data.vehicleId,
      stopovers: data.stopovers,
      distance: data.distance,
      duration: data.duration,
      status: "active",
    });

    return {
      message: "Ride posted successfully!",
      ride: RideMapper.toRideDTO(ride),
    };
  }
}
