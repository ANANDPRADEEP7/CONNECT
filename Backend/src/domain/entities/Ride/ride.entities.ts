/**
 * Ride Entity – Domain Layer
 * Represents a ride posted by a rider.
 */
export interface Ride {
  _id: string;
  riderId: string;        // User._id of the rider posting
  from: string;           // Starting location
  to: string;             // Destination
  date: string;           // ISO date string
  time: string;           // Departure time e.g. "09:30"
  seats: number;          // Available passenger seats
  pricePerSeat: number;   // Price per seat in ₹
  description?: string;   // Optional notes / route info
  status: "active" | "completed" | "cancelled";
  createdAt?: Date;
  updatedAt?: Date;
}
