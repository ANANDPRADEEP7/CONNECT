import { Coordinate, Ride, Stopover, RideCancellation } from "../../../domain/entities/Ride/ride.entities";

export interface RideDTO {
  id: string;
  riderId: string;
  from: Coordinate;
  to: Coordinate;
  date: string;
  time: string;
  seats: number;
  pricePerSeat: number;
  description?: string;
  vehicleId?: string;
  status: "active" | "completed" | "cancelled" | "suspended";
  stopovers?: Stopover[];
  distance?: string;
  duration?: string;
  cancellation?: RideCancellation;
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
      vehicleId: ride.vehicleId?.toString(),
      status: ride.status as "active" | "completed" | "cancelled" | "suspended",
      stopovers: ride.stopovers,
      distance: ride.distance,
      duration: ride.duration,
      cancellation: ride.cancellation,
      createdAt: ride.createdAt,
      updatedAt: ride.updatedAt,
    };
  }

  static toRideDTOList(rides: Ride[]): RideDTO[] {
    return rides.map((ride) => RideMapper.toRideDTO(ride));
  }
}
