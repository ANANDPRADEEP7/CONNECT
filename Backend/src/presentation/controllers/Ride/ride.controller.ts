import { NextFunction, Response } from "express";
import { AuthRequest } from "../../middleware/AuthMiddleware";
import { HttpStatus } from "../../../domain/enums/HttpStatus.enum";
import { ResponseMessage } from "../../../domain/enums/ResponseMessage.enum";
import { ICreateRideUseCase } from "../../../application/interfaces/usecases/Rider/createRide.usecase.interface";
import { IGetRidesUseCase } from "../../../application/interfaces/usecases/Rider/getRides.usecase.interface";
import { IGetMyRidesUseCase } from "../../../application/interfaces/usecases/Rider/getMyRides.usecase.interface";
import { validateCreateRideBody } from "../../validationSchemas/ride.validation";
import { createApiResponse } from "../../utils/apiResponse";

export class RideController {
  constructor(
    private readonly _createRideUseCase: ICreateRideUseCase,
    private readonly _getRidesUseCase: IGetRidesUseCase,
    private readonly _getMyRidesUseCase: IGetMyRidesUseCase,
  ) {}

  createRide = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const riderId = req.user?.id;

      if (!riderId) {
        return res
          .status(HttpStatus.UNAUTHORIZED)
          .json(createApiResponse(HttpStatus.UNAUTHORIZED, ResponseMessage.AUTH_REQUIRED));
      }

      const validation = validateCreateRideBody(req.body);
      if (!validation.valid) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json(
            createApiResponse(HttpStatus.BAD_REQUEST, validation.message || "Validation failed"),
          );
      }

      const { from, to, date, time, seats, pricePerSeat, description } = req.body;

      const response = await this._createRideUseCase.execute(riderId, {
        from,
        to,
        date,
        time,
        seats: Number(seats),
        pricePerSeat: Number(pricePerSeat),
        description,
      });

      return res
        .status(HttpStatus.CREATED)
        .json(createApiResponse(HttpStatus.CREATED, "Ride created successfully", response));
    } catch (error) {
      next(error);
    }
  };

  /** GET /ride – Get all active rides */
  getAllRides = async (_req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const rides = await this._getRidesUseCase.execute();
      return res
        .status(HttpStatus.OK)
        .json(createApiResponse(HttpStatus.OK, "All rides fetched successfully", rides));
    } catch (error) {
      next(error);
    }
  };

  /** GET /ride/my – Get the current rider's own rides */
  getMyRides = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const riderId = req.user?.id;
      if (!riderId) {
        return res
          .status(HttpStatus.UNAUTHORIZED)
          .json(createApiResponse(HttpStatus.UNAUTHORIZED, ResponseMessage.AUTH_REQUIRED));
      }
      const rides = await this._getMyRidesUseCase.execute(riderId);
      return res
        .status(HttpStatus.OK)
        .json(createApiResponse(HttpStatus.OK, "My rides fetched successfully", rides));
    } catch (error) {
      next(error);
    }
  };
}
