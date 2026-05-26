import { IRideRepository } from "../../interfaces/repositories/Ride/IRideRepository";
import {
  GetMyRidesResponse,
  IGetMyRidesUseCase,
} from "../../interfaces/usecases/Rider/getMyRides.usecase.interface";

import { RideMapper } from "../../mappers/Ride/RideMapper";

export class GetMyRidesUseCase implements IGetMyRidesUseCase {
  constructor(private readonly _rideRepository: IRideRepository) {}

  async execute(riderId: string): Promise<GetMyRidesResponse[]> {
    const rides = await this._rideRepository.findByRider(riderId);

    return RideMapper.toRideDTOList(rides);
  }
}
