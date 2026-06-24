import { IBookingRepository } from "../../interfaces/repositories/Booking/IBookingRepository";
import { IRideRepository } from "../../interfaces/repositories/Ride/IRideRepository";
import { Booking } from "../../../domain/entities/Booking/booking.entities";
import { CustomError } from "../../../domain/errors/CustomError";
import { HttpStatus } from "../../../domain/enums/HttpStatus.enum";

export class UpdateBookingStatusUseCase {
  constructor(
    private readonly _bookingRepository: IBookingRepository,
    private readonly _rideRepository: IRideRepository
  ) {}

  async execute(bookingId: string, userId: string, status: "confirmed" | "cancelled" | "rejected"): Promise<Booking> {
    const booking = await this._bookingRepository.findById(bookingId);
    if (!booking) {
      throw new CustomError("Booking not found", HttpStatus.NOT_FOUND);
    }

    // Passengers can only cancel their own bookings
    if (status === "cancelled") {
      if (booking.passengerId._id.toString() !== userId && booking.driverId._id.toString() !== userId) {
        throw new CustomError("Unauthorized to cancel this booking", HttpStatus.FORBIDDEN);
      }
      if (booking.status === "cancelled" || booking.status === "rejected") {
        throw new CustomError(`Booking is already ${booking.status}`, HttpStatus.BAD_REQUEST);
      }
    } 
    // Drivers can approve (confirm) or reject bookings
    else if (status === "confirmed" || status === "rejected") {
      if (booking.driverId._id.toString() !== userId) {
        throw new CustomError("Only the driver can approve or reject this booking", HttpStatus.FORBIDDEN);
      }
      if (booking.status !== "pending") {
        throw new CustomError(`Cannot change status from ${booking.status} to ${status}`, HttpStatus.BAD_REQUEST);
      }

      if (status === "confirmed") {
        const ride = await this._rideRepository.findById(booking.rideId._id.toString());
        if (!ride) {
          throw new CustomError("Associated ride not found", HttpStatus.NOT_FOUND);
        }
        const confirmedSeats = await this._bookingRepository.getConfirmedSeatsCount(ride._id.toString());
        if (ride.seats - confirmedSeats < booking.seatsBooked) {
          throw new CustomError("Not enough seats available to confirm this booking", HttpStatus.BAD_REQUEST);
        }
      }
    }

    const updated = await this._bookingRepository.updateStatus(bookingId, status);
    if (!updated) {
      throw new CustomError("Failed to update booking status", HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return updated;
  }
}
