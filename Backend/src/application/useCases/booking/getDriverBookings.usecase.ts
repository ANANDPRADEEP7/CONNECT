import { IBookingRepository } from "../../interfaces/repositories/Booking/IBookingRepository";
import { Booking } from "../../../domain/entities/Booking/booking.entities";

export class GetDriverBookingsUseCase {
  constructor(private readonly _bookingRepository: IBookingRepository) {}

  async execute(driverId: string): Promise<Booking[]> {
    return await this._bookingRepository.findByDriverId(driverId);
  }
}
