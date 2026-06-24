import { Coordinate } from "../../../../domain/entities/Ride/ride.entities";

export interface GetMyRidesResponse {
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

export interface IGetMyRidesUseCase {
  execute(riderId: string): Promise<GetMyRidesResponse[]>;
}
