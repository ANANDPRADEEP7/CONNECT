import { RideDTO } from "../../../mappers/Ride/RideMapper";

export interface AdminDriverDTO {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
}

export interface AdminVehicleDTO {
  id: string;
  name: string;
  color?: string;
  capacity: number;
}

export interface AdminRideDTO extends Omit<RideDTO, "riderId" | "vehicleId"> {
  driver: AdminDriverDTO;
  vehicle?: AdminVehicleDTO;
  bookedSeats: number;
  cancellation?: {
    cancelledBy: "Driver" | "Passenger" | "Admin";
    reason: string;
    timestamp: Date;
  };
}

export interface AdminRidesStats {
  totalRides: number;
  activeRides: number;
  completedRides: number;
  cancelledRides: number;
  suspendedRides: number;
}

export interface GetAdminRidesResponse {
  data: AdminRideDTO[];
  totalPages: number;
  total: number;
  page: number;
  limit: number;
  stats: AdminRidesStats;
}

export interface IGetAdminRidesUseCase {
  execute(
    page: number,
    limit: number,
    search?: string,
    filter?: string
  ): Promise<GetAdminRidesResponse>;
}
