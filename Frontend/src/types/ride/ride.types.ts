/**
 * Coordinate – a geographic location with a human-readable name.
 * Used for ride origin, destination, and stopover coordinates.
 */
export interface Coordinate {
  name: string; // Human-readable place name (e.g. "Mumbai, Maharashtra, India")
  latitude: number; // Decimal latitude
  longitude: number; // Decimal longitude
}

export interface Stopover {
  id: string;
  name: string;
  coords: Coordinate;
  price?: number; // optional per-stopover boarding price
}

export interface RidePayload {
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

export interface RideCancellation {
  cancelledBy: "Driver" | "Passenger" | "Admin";
  reason: string;
  timestamp: string;
}

export interface Ride {
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
  createdAt: string;
  stopovers?: Stopover[];
  distance?: string;
  duration?: string;
  cancellation?: RideCancellation;
}

export interface SearchDriver {
  name: string;
  rating: number;
  avatar: string;
  trips: number;
}

export interface SearchRide extends Omit<Ride, "riderId" | "vehicleId"> {
  driver: SearchDriver;
  vehicle: string;
}

export interface SearchRidesParams {
  from?: string;
  to?: string;
  date?: string;
  seats?: number;
}
