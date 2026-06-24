import { IBookingRepository } from "../../interfaces/repositories/Booking/IBookingRepository";
import { IRideRepository } from "../../interfaces/repositories/Ride/IRideRepository";
import { Booking } from "../../../domain/entities/Booking/booking.entities";
import { CustomError } from "../../../domain/errors/CustomError";
import { HttpStatus } from "../../../domain/enums/HttpStatus.enum";

export class CreateBookingUseCase {
  constructor(
    private readonly _bookingRepository: IBookingRepository,
    private readonly _rideRepository: IRideRepository
  ) {}

  async execute(rideId: string, passengerId: string, seatsToBook: number): Promise<Booking> {
    const ride = await this._rideRepository.findById(rideId);
    if (!ride) {
      throw new CustomError("Ride not found", HttpStatus.NOT_FOUND);
    }

    if (ride.riderId.toString() === passengerId) {
      throw new CustomError("You cannot book your own ride", HttpStatus.BAD_REQUEST);
    }

    if (ride.status !== "active") {
      throw new CustomError("Ride is not active and cannot be booked", HttpStatus.BAD_REQUEST);
    }

    const confirmedSeats = await this._bookingRepository.getConfirmedSeatsCount(rideId);
    const availableSeats = ride.seats - confirmedSeats;

    if (seatsToBook > availableSeats) {
      throw new CustomError(`Only ${availableSeats} seats available`, HttpStatus.BAD_REQUEST);
    }

    const bookingMode = ride.bookingMode || "instant";
    const status = bookingMode === "instant" ? "confirmed" : "pending";
    const totalPrice = ride.pricePerSeat * seatsToBook;

    const bookingData: Partial<Booking> = {
      rideId,
      passengerId,
      driverId: ride.riderId,
      seatsBooked: seatsToBook,
      totalPrice,
      status,
    };

    return await this._bookingRepository.create(bookingData);
  }
}
