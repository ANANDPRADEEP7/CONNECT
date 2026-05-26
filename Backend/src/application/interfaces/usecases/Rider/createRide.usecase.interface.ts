export interface CreateRideRequest {
  from: string;
  to: string;
  date: string;
  time: string;
  seats: number;
  pricePerSeat: number;
  description?: string;
}

import { RideDTO } from "../../../../application/mappers/Ride/RideMapper";

export interface CreateRideResponse {
  message: string;
  ride: RideDTO;
}

export interface ICreateRideUseCase {
  execute(riderId: string, data: CreateRideRequest): Promise<CreateRideResponse>;
}
