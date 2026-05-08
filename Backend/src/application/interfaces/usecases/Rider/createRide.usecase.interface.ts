

export interface CreateRideRequest {
  from: string;
  to: string;
  date: string;
  time: string;
  seats: number;
  pricePerSeat: number;
  description?: string;
}

export interface RideData {
  id: string;
  riderId: string;
  from: string;
  to: string;
  date: string;
  time: string;
  seats: number;
  pricePerSeat: number;
  description?: string;
  status: "active" | "completed" | "cancelled";
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateRideResponse {
  message: string;
  ride: RideData;
}

export interface ICreateRideUseCase {
  execute(
    riderId: string,
    data: CreateRideRequest
  ): Promise<CreateRideResponse>;
}