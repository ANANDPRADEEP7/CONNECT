// application/useCases/ride/getRides.usecase.ts

import { IRideRepository } from "../../interfaces/repositories/Ride/IRideRepository";
import {
  GetRidesResponse,
  IGetRidesUseCase,
} from "../../interfaces/usecases/Rider/getRides.usecase.interface";

export class GetRidesUseCase implements IGetRidesUseCase {
  constructor(private readonly rideRepository: IRideRepository) {}

  async execute(): Promise<GetRidesResponse[]> {
    const rides = await this.rideRepository.findAll({
      status: "active",
    });

    return rides.map((ride) => ({
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
    }));
  }
}
