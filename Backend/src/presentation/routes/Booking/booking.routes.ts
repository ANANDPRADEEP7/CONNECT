import { Router } from "express";
import { BookingController } from "../../controllers/Booking/booking.controller";
import { CreateBookingUseCase } from "../../../application/useCases/booking/createBooking.usecase";
import { GetMyBookingsUseCase } from "../../../application/useCases/booking/getMyBookings.usecase";
import { GetDriverBookingsUseCase } from "../../../application/useCases/booking/getDriverBookings.usecase";
import { UpdateBookingStatusUseCase } from "../../../application/useCases/booking/updateBookingStatus.usecase";
import { BookingRepository } from "../../../infrastructure/repository/Booking/BookingRepository";
import { RideRepository } from "../../../infrastructure/repository/Rides/RideRepository";
import { authenticateUser } from "../../middleware/AuthMiddleware";
import { AppContainer } from "../../../infrastructure/DI/AppContainer";

const bookingRouter = Router();

// DI
const { tokenService } = AppContainer.getInstance();
const bookingRepository = new BookingRepository();
const rideRepository = new RideRepository();

const createBookingUseCase = new CreateBookingUseCase(bookingRepository, rideRepository);
const getMyBookingsUseCase = new GetMyBookingsUseCase(bookingRepository);
const getDriverBookingsUseCase = new GetDriverBookingsUseCase(bookingRepository);
const updateBookingStatusUseCase = new UpdateBookingStatusUseCase(bookingRepository, rideRepository);

const bookingController = new BookingController(
  createBookingUseCase,
  getMyBookingsUseCase,
  getDriverBookingsUseCase,
  updateBookingStatusUseCase
);

// Routes
bookingRouter.use(authenticateUser(tokenService)); // Protect all routes

bookingRouter.post("/", (req, res, next) => bookingController.createBooking(req, res, next));
bookingRouter.get("/my-bookings", (req, res, next) => bookingController.getMyBookings(req, res, next));
bookingRouter.get("/driver-bookings", (req, res, next) => bookingController.getDriverBookings(req, res, next));
bookingRouter.patch("/:id/status", (req, res, next) => bookingController.updateBookingStatus(req, res, next));

export default bookingRouter;
