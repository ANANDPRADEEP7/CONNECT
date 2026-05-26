import { Ride } from "../../../domain/entities/Ride/ride.entities";

export interface RideDTO {
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

export class RideMapper {
  static toRideDTO(ride: Ride): RideDTO {
    return {
      id: ride._id!.toString(),
      riderId: ride.riderId.toString(),
      from: ride.from,
      to: ride.to,
      date: ride.date,
      time: ride.time,
      seats: ride.seats,
      pricePerSeat: ride.pricePerSeat,
      description: ride.description,
      status: ride.status as "active" | "completed" | "cancelled",
      createdAt: ride.createdAt,
      updatedAt: ride.updatedAt,
    };
  }

  static toRideDTOList(rides: Ride[]): RideDTO[] {
    return rides.map((ride) => RideMapper.toRideDTO(ride));
  }
}
