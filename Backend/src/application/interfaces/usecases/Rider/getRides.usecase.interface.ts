// interfaces/usecases/Rider/getRides.usecase.interface.ts
import { Coordinate } from "../../../../domain/entities/Ride/ride.entities";

export interface GetRidesResponse {
  id: string;
  riderId: string;
  from: Coordinate;
  to: Coordinate;
  date: string;
  time: string;
  seats: number;
  pricePerSeat: number;
  description?: string;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IGetRidesUseCase {
  execute(): Promise<GetRidesResponse[]>;
}
