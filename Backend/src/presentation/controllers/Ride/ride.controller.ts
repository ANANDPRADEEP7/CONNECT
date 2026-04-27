import { NextFunction, Response } from "express";
import { AuthRequest } from "../../middleware/AuthMiddleware";
import { CreateRideUseCase } from "../../../application/useCases/ride/createRide.usecase";
import { GetRidesUseCase } from "../../../application/useCases/ride/getRides.usecase";
import { GetMyRidesUseCase } from "../../../application/useCases/ride/getMyRides.usecase";
import { HttpStatus } from "../../../domain/enums/HttpStatus.enum";
import { ResponseMessage } from "../../../domain/enums/ResponseMessage.enum";

/**
 * RideController – Presentation Layer
 * Handles HTTP requests for ride operations.
 */
export class RideController {
  constructor(
    private readonly createRideUseCase: CreateRideUseCase,
    private readonly getRidesUseCase: GetRidesUseCase,
    private readonly getMyRidesUseCase: GetMyRidesUseCase
  ) {}

  /** POST /ride – Create a new ride posting */
  createRide = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const riderId = req.user?.id;
      if (!riderId) {
        return res.status(HttpStatus.UNAUTHORIZED).json({ message: ResponseMessage.AUTH_REQUIRED });
      }

      const { from, to, date, time, seats, pricePerSeat, description } = req.body;
      const ride = await this.createRideUseCase.execute(riderId, {
        from,
        to,
        date,
        time,
        seats: Number(seats),
        pricePerSeat: Number(pricePerSeat),
        description,
      });

      return res.status(HttpStatus.CREATED).json({ message: "Ride posted successfully!", ride });
    } catch (error) {
      next(error);
    }
  };

  /** GET /ride – Get all active rides */
  getAllRides = async (_req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const rides = await this.getRidesUseCase.execute();
      return res.status(HttpStatus.OK).json(rides);
    } catch (error) {
      next(error);
    }
  };

  /** GET /ride/my – Get the current rider's own rides */
  getMyRides = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const riderId = req.user?.id;
      if (!riderId) {
        return res.status(HttpStatus.UNAUTHORIZED).json({ message: ResponseMessage.AUTH_REQUIRED });
      }
      const rides = await this.getMyRidesUseCase.execute(riderId);
      return res.status(HttpStatus.OK).json(rides);
    } catch (error) {
      next(error);
    }
  };
}
