import { Coordinate, Stopover } from "../../../../domain/entities/Ride/ride.entities";

export interface CreateRideRequest {
  from: Coordinate;
  to: Coordinate;
  date: string;
  time: string;
  seats: number;
  pricePerSeat: number;
  description?: string;
  vehicleId?: string;
  stopovers?: Stopover[];
  distance?: string;
  duration?: string;
}

import { RideDTO } from "../../../../application/mappers/Ride/RideMapper";

export interface CreateRideResponse {
  message: string;
  ride: RideDTO;
}

export interface ICreateRideUseCase {
  execute(riderId: string, data: CreateRideRequest): Promise<CreateRideResponse>;
}
