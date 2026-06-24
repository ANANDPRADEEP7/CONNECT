/**
 * Coordinate Value Object – shared across ride locations and stopovers.
 */
export interface Coordinate {
  name: string; // Human-readable place name (e.g. "Mumbai, Maharashtra, India")
  latitude: number; // Decimal latitude
  longitude: number; // Decimal longitude
}

/**
 * Stopover – an intermediate point along a ride route.
 */
export interface Stopover {
  id: string;
  name: string; // Display name (kept for backward compat & quick display)
  coords: Coordinate;
  price?: number; // Optional per-stopover fare (passengers boarding here pay this price)
}

export interface RideCancellation {
  cancelledBy: "Driver" | "Passenger" | "Admin";
  reason: string;
  timestamp: Date;
}

/**
 * Ride Entity – Domain Layer
 * Represents a ride posted by a rider.
 */
export interface Ride {
  _id: string;
  riderId: string; // User._id of the rider posting
  from: Coordinate; // Starting location as coordinates + name
  to: Coordinate; // Destination as coordinates + name
  date: string; // ISO date string
  time: string; // Departure time e.g. "09:30"
  seats: number; // Available passenger seats
  pricePerSeat: number; // Price per seat in ₹
  description?: string; // Optional notes / route info
  vehicleId?: string; // Optional reference to the Vehicle used
  status: "active" | "completed" | "cancelled" | "suspended";
  stopovers?: Stopover[];
  distance?: string;
  duration?: string;
  cancellation?: RideCancellation;
  bookingMode?: "instant" | "review";
  createdAt?: Date;
  updatedAt?: Date;
}
