export interface Booking {
  _id: string;
  rideId: string;
  passengerId: string;
  driverId: string;
  seatsBooked: number;
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled" | "rejected";
  createdAt?: Date;
  updatedAt?: Date;
}
