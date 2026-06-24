import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middleware/AuthMiddleware";
import { CreateBookingUseCase } from "../../../application/useCases/booking/createBooking.usecase";
import { GetMyBookingsUseCase } from "../../../application/useCases/booking/getMyBookings.usecase";
import { GetDriverBookingsUseCase } from "../../../application/useCases/booking/getDriverBookings.usecase";
import { UpdateBookingStatusUseCase } from "../../../application/useCases/booking/updateBookingStatus.usecase";
import { HttpStatus } from "../../../domain/enums/HttpStatus.enum";
import { createApiResponse } from "../../utils/apiResponse";

export class BookingController {
  constructor(
    private readonly _createBookingUseCase: CreateBookingUseCase,
    private readonly _getMyBookingsUseCase: GetMyBookingsUseCase,
    private readonly _getDriverBookingsUseCase: GetDriverBookingsUseCase,
    private readonly _updateBookingStatusUseCase: UpdateBookingStatusUseCase
  ) {}

  createBooking = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const passengerId = req.user?.id;
      if (!passengerId) return res.status(HttpStatus.UNAUTHORIZED).json(createApiResponse(HttpStatus.UNAUTHORIZED, "Unauthorized"));

      const { rideId, seatsToBook } = req.body;
      const booking = await this._createBookingUseCase.execute(rideId, passengerId, Number(seatsToBook));
      
      return res.status(HttpStatus.CREATED).json(createApiResponse(HttpStatus.CREATED, "Booking request sent successfully", booking));
    } catch (error) {
      next(error);
    }
  };

  getMyBookings = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const passengerId = req.user?.id;
      if (!passengerId) return res.status(HttpStatus.UNAUTHORIZED).json(createApiResponse(HttpStatus.UNAUTHORIZED, "Unauthorized"));

      const bookings = await this._getMyBookingsUseCase.execute(passengerId);
      return res.status(HttpStatus.OK).json(createApiResponse(HttpStatus.OK, "Bookings fetched", bookings));
    } catch (error) {
      next(error);
    }
  };

  getDriverBookings = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const driverId = req.user?.id;
      if (!driverId) return res.status(HttpStatus.UNAUTHORIZED).json(createApiResponse(HttpStatus.UNAUTHORIZED, "Unauthorized"));

      const bookings = await this._getDriverBookingsUseCase.execute(driverId);
      return res.status(HttpStatus.OK).json(createApiResponse(HttpStatus.OK, "Driver bookings fetched", bookings));
    } catch (error) {
      next(error);
    }
  };

  updateBookingStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(HttpStatus.UNAUTHORIZED).json(createApiResponse(HttpStatus.UNAUTHORIZED, "Unauthorized"));

      const bookingId = req.params.id as string;
      const { status } = req.body; // "confirmed" | "cancelled" | "rejected"

      const booking = await this._updateBookingStatusUseCase.execute(
        bookingId,
        userId,
        status as "confirmed" | "cancelled" | "rejected"
      );
      return res.status(HttpStatus.OK).json(createApiResponse(HttpStatus.OK, "Booking status updated", booking));
    } catch (error) {
      next(error);
    }
  };
}
