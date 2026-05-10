import { IRideRepository } from "../../interfaces/repositories/Ride/IRideRepository";
import {
  GetMyRidesResponse,
  IGetMyRidesUseCase,
} from "../../interfaces/usecases/Rider/getMyRides.usecase.interface";

export class GetMyRidesUseCase implements IGetMyRidesUseCase {
  constructor(private readonly rideRepository: IRideRepository) {}

  async execute(riderId: string): Promise<GetMyRidesResponse[]> {
    const rides = await this.rideRepository.findByRider(riderId);

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
