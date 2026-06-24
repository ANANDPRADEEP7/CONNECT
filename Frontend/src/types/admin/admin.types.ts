import type { Coordinate } from "../ride/ride.types";

export interface AdminUserItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  verified: boolean;
  blocked: boolean;
}

export type RiderStatus = "pending" | "approved" | "rejected";

export interface AdminRiderItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: RiderStatus;
  bio?: string;
  govId?: string;
  vehicleImage?: string;
  pucImage?: string;
  rcImage?: string;
  rejectionReason?: string | null;
  vehicles?: AdminVehicleItem[];
}

export interface AdminDriverItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
}

export interface AdminVehicleItem {
  id: string;
  name: string;
  model?: string;
  color?: string;
  capacity: number;
  rcNumber?: string;
  type?: string;
  images?: string[];
}

export interface AdminStopover {
  id: string;
  name: string;
  coords: Coordinate;
}

export interface AdminRideItem {
  id: string;
  from: Coordinate;
  to: Coordinate;
  date: string;
  time: string;
  seats: number;
  pricePerSeat: number;
  description?: string;
  status: "active" | "completed" | "cancelled" | "suspended";
  stopovers?: AdminStopover[];
  distance?: string;
  duration?: string;
  createdAt?: string;
  updatedAt?: string;
  driver: AdminDriverItem;
  vehicle?: AdminVehicleItem;
  bookedSeats: number;
  cancellation?: {
    cancelledBy: "Driver" | "Passenger" | "Admin";
    reason: string;
    timestamp: Date | string;
  };
}

export interface AdminRidesStats {
  totalRides: number;
  activeRides: number;
  completedRides: number;
  cancelledRides: number;
  suspendedRides: number;
}
