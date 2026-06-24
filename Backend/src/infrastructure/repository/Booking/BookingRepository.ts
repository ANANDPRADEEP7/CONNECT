import { Booking } from "../../../domain/entities/Booking/booking.entities";
import { BookingModel } from "../../schema/bookingSchema";
import { IBookingRepository } from "../../../application/interfaces/repositories/Booking/IBookingRepository";

export class BookingRepository implements IBookingRepository {
  async create(booking: Partial<Booking>): Promise<Booking> {
    const createdBooking = await BookingModel.create(booking);
    return createdBooking.toObject() as Booking;
  }

  async findById(id: string): Promise<Booking | null> {
    const booking = await BookingModel.findById(id)
      .populate("rideId")
      .populate("passengerId", "name email avatar")
      .populate("driverId", "name email avatar rating")
      .lean();
    return booking as unknown as Booking | null;
  }

  async findByPassengerId(passengerId: string): Promise<Booking[]> {
    const bookings = await BookingModel.find({ passengerId })
      .populate("rideId")
      .populate("driverId", "name email avatar rating phonenumber")
      .sort({ createdAt: -1 })
      .lean();
    return bookings as unknown as Booking[];
  }

  async findByRideId(rideId: string): Promise<Booking[]> {
    const bookings = await BookingModel.find({ rideId })
      .populate("passengerId", "name email avatar rating phonenumber")
      .sort({ createdAt: -1 })
      .lean();
    return bookings as unknown as Booking[];
  }

  async findByDriverId(driverId: string): Promise<Booking[]> {
    const bookings = await BookingModel.find({ driverId })
      .populate("rideId")
      .populate("passengerId", "name email avatar rating phonenumber")
      .sort({ createdAt: -1 })
      .lean();
    return bookings as unknown as Booking[];
  }

  async updateStatus(id: string, status: "pending" | "confirmed" | "cancelled" | "rejected"): Promise<Booking | null> {
    const updated = await BookingModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    )
      .populate("rideId")
      .populate("passengerId", "name email avatar")
      .populate("driverId", "name email avatar")
      .lean();
    return updated as unknown as Booking | null;
  }

  async getConfirmedSeatsCount(rideId: string): Promise<number> {
    const bookings = await BookingModel.find({
      rideId,
      status: "confirmed"
    }).lean();
    return bookings.reduce((sum, b) => sum + b.seatsBooked, 0);
  }
}
