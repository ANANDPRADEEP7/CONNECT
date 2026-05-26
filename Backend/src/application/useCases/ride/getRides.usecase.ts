// application/useCases/ride/getRides.usecase.ts

import { IRideRepository } from "../../interfaces/repositories/Ride/IRideRepository";
import {
  GetRidesResponse,
  IGetRidesUseCase,
} from "../../interfaces/usecases/Rider/getRides.usecase.interface";

import { RideMapper } from "../../mappers/Ride/RideMapper";

export class GetRidesUseCase implements IGetRidesUseCase {
  constructor(private readonly _rideRepository: IRideRepository) {}

  async execute(): Promise<GetRidesResponse[]> {
    const rides = await this._rideRepository.findAll({
      status: "active",
    });

    return RideMapper.toRideDTOList(rides);
  }
}
