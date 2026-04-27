import { Response } from "express";
import { AuthRequest } from "../../middleware/AuthMiddleware";
import { CreateRideUseCase } from "../../../application/useCases/ride/createRide.usecase";
import { GetRidesUseCase } from "../../../application/useCases/ride/getRides.usecase";
import { GetMyRidesUseCase } from "../../../application/useCases/ride/getMyRides.usecase";

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
  createRide = async (req: AuthRequest, res: Response) => {
    try {
      const riderId = req.user?.id || req.user?._id || req.user?.userId;
      if (!riderId) {
        return res.status(401).json({ message: "Unauthorized" });
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

      return res.status(201).json({ message: "Ride posted successfully!", ride });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  /** GET /ride – Get all active rides */
  getAllRides = async (_req: AuthRequest, res: Response) => {
    try {
      const rides = await this.getRidesUseCase.execute();
      return res.status(200).json(rides);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  /** GET /ride/my – Get the current rider's own rides */
  getMyRides = async (req: AuthRequest, res: Response) => {
    try {
      const riderId = req.user?.id || req.user?._id || req.user?.userId;
      if (!riderId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const rides = await this.getMyRidesUseCase.execute(riderId);
      return res.status(200).json(rides);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };
}
