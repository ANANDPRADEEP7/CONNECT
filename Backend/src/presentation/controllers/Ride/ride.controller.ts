import { NextFunction, Response } from "express";
import { AuthRequest } from "../../middleware/AuthMiddleware";
import { RideMapper } from "../../../application/mappers/Ride/RideMapper";
import { HttpStatus } from "../../../domain/enums/HttpStatus.enum";
import { ResponseMessage } from "../../../domain/enums/ResponseMessage.enum";
import { ICreateRideUseCase } from "../../../application/interfaces/usecases/Rider/createRide.usecase.interface";
import { IGetRidesUseCase } from "../../../application/interfaces/usecases/Rider/getRides.usecase.interface";
import { IGetMyRidesUseCase } from "../../../application/interfaces/usecases/Rider/getMyRides.usecase.interface";
import { GetRideByIdUseCase } from "../../../application/useCases/ride/getRideById.usecase";
import { UpdateRideUseCase } from "../../../application/useCases/ride/updateRide.usecase";
import { CancelRideUseCase } from "../../../application/useCases/ride/cancelRide.usecase";
import { DeleteRideUseCase } from "../../../application/useCases/ride/deleteRide.usecase";
import { SearchRidesUseCase } from "../../../application/useCases/ride/searchRides.usecase";
import { validateCreateRideBody } from "../../validationSchemas/ride.validation";
import { createApiResponse } from "../../utils/apiResponse";

export class RideController {
  constructor(
    private readonly _createRideUseCase: ICreateRideUseCase,
    private readonly _getRidesUseCase: IGetRidesUseCase,
    private readonly _getMyRidesUseCase: IGetMyRidesUseCase,
    private readonly _getRideByIdUseCase: GetRideByIdUseCase,
    private readonly _updateRideUseCase: UpdateRideUseCase,
    private readonly _cancelRideUseCase: CancelRideUseCase,
    private readonly _deleteRideUseCase: DeleteRideUseCase,
    private readonly _searchRidesUseCase: SearchRidesUseCase,
  ) { }

  searchRides = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { from, to, date, seats } = req.query;
      const response = await this._searchRidesUseCase.execute({
        from: from ? String(from) : undefined,
        to: to ? String(to) : undefined,
        date: date ? String(date) : undefined,
        seats: seats ? Number(seats) : undefined,
      });
      return res
        .status(HttpStatus.OK)
        .json(createApiResponse(HttpStatus.OK, "Rides search successful", response));
    } catch (error) {
      next(error);
    }
  };

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

      const { from, to, date, time, seats, pricePerSeat, description, vehicleId, stopovers, distance, duration } = req.body;

      const response = await this._createRideUseCase.execute(riderId, {
        from,
        to,
        date,
        time,
        seats: Number(seats),
        pricePerSeat: Number(pricePerSeat),
        description,
        vehicleId,
        stopovers,
        distance,
        duration,
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

  /** GET /ride/:id – Get a single ride by ID */
  getRideById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const ride = await this._getRideByIdUseCase.execute(req.params.id as string);
      if (!ride) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json(createApiResponse(HttpStatus.NOT_FOUND, "Ride not found"));
      }
      return res
        .status(HttpStatus.OK)
        .json(createApiResponse(HttpStatus.OK, "Ride fetched", RideMapper.toRideDTO(ride)));
    } catch (error) {
      next(error);
    }
  };

  /** PATCH /ride/:id – Update ride details */
  updateRide = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const riderId = req.user?.id;
      if (!riderId) {
        return res
          .status(HttpStatus.UNAUTHORIZED)
          .json(createApiResponse(HttpStatus.UNAUTHORIZED, ResponseMessage.AUTH_REQUIRED));
      }
      const updated = await this._updateRideUseCase.execute(
        req.params.id as string,
        riderId,
        req.body,
      );
      return res
        .status(HttpStatus.OK)
        .json(
          createApiResponse(
            HttpStatus.OK,
            "Ride updated successfully",
            RideMapper.toRideDTO(updated!),
          ),
        );
    } catch (error: any) {
      if (error.message === "Not authorized to edit this ride") {
        return res
          .status(HttpStatus.FORBIDDEN)
          .json(createApiResponse(HttpStatus.FORBIDDEN, error.message));
      }
      next(error);
    }
  };

  /** PATCH /ride/:id/cancel – Cancel a ride */
  cancelRide = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const riderId = req.user?.id;
      if (!riderId) {
        return res
          .status(HttpStatus.UNAUTHORIZED)
          .json(createApiResponse(HttpStatus.UNAUTHORIZED, ResponseMessage.AUTH_REQUIRED));
      }
      const { reason } = req.body;
      if (!reason || typeof reason !== 'string') {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json(createApiResponse(HttpStatus.BAD_REQUEST, "Cancellation reason is required"));
      }
      await this._cancelRideUseCase.execute(req.params.id as string, riderId, reason);
      return res
        .status(HttpStatus.OK)
        .json(createApiResponse(HttpStatus.OK, "Ride cancelled successfully"));
    } catch (error: any) {
      if (error.message === "Not authorized to cancel this ride") {
        return res
          .status(HttpStatus.FORBIDDEN)
          .json(createApiResponse(HttpStatus.FORBIDDEN, error.message));
      }
      next(error);
    }
  };

  /** DELETE /ride/:id – Delete a ride completely */
  deleteRide = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const riderId = req.user?.id;
      if (!riderId) {
        return res
          .status(HttpStatus.UNAUTHORIZED)
          .json(createApiResponse(HttpStatus.UNAUTHORIZED, ResponseMessage.AUTH_REQUIRED));
      }
      await this._deleteRideUseCase.execute(req.params.id as string, riderId);
      return res
        .status(HttpStatus.OK)
        .json(createApiResponse(HttpStatus.OK, "Ride deleted successfully"));
    } catch (error: any) {
      if (error.message === "Not authorized to delete this ride") {
        return res
          .status(HttpStatus.FORBIDDEN)
          .json(createApiResponse(HttpStatus.FORBIDDEN, error.message));
      }
      next(error);
    }
  };
}
