import { Booking } from "../../../../domain/entities/Booking/booking.entities";

export interface IBookingRepository {
  create(booking: Partial<Booking>): Promise<Booking>;
  findById(id: string): Promise<Booking | null>;
  findByPassengerId(passengerId: string): Promise<Booking[]>;
  findByRideId(rideId: string): Promise<Booking[]>;
  findByDriverId(driverId: string): Promise<Booking[]>;
  updateStatus(id: string, status: "pending" | "confirmed" | "cancelled" | "rejected"): Promise<Booking | null>;
  getConfirmedSeatsCount(rideId: string): Promise<number>;
}
