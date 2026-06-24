import { IBookingRepository } from "../../interfaces/repositories/Booking/IBookingRepository";
import { Booking } from "../../../domain/entities/Booking/booking.entities";

export class GetMyBookingsUseCase {
  constructor(private readonly _bookingRepository: IBookingRepository) {}

  async execute(passengerId: string): Promise<Booking[]> {
    return await this._bookingRepository.findByPassengerId(passengerId);
  }
}
