import { NextFunction, Response } from "express";
import { AuthRequest } from "../../middleware/AuthMiddleware";
import { HttpStatus } from "../../../domain/enums/HttpStatus.enum";
import { ResponseMessage } from "../../../domain/enums/ResponseMessage.enum";
import { createApiResponse } from "../../utils/apiResponse";

import { CreateVehicleUseCase } from "../../../application/useCases/vehicle/createVehicle.usecase";
import { GetMyVehiclesUseCase } from "../../../application/useCases/vehicle/getMyVehicles.usecase";
import { GetVehicleByIdUseCase } from "../../../application/useCases/vehicle/getVehicleById.usecase";
import { UpdateVehicleUseCase } from "../../../application/useCases/vehicle/updateVehicle.usecase";
import { DeleteVehicleUseCase } from "../../../application/useCases/vehicle/deleteVehicle.usecase";

export class VehicleController {
  constructor(
    private readonly _createVehicleUseCase: CreateVehicleUseCase,
    private readonly _getMyVehiclesUseCase: GetMyVehiclesUseCase,
    private readonly _getVehicleByIdUseCase: GetVehicleByIdUseCase,
    private readonly _updateVehicleUseCase: UpdateVehicleUseCase,
    private readonly _deleteVehicleUseCase: DeleteVehicleUseCase,
  ) {}

  createVehicle = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const riderId = req.user?.id;
      if (!riderId) {
        return res
          .status(HttpStatus.UNAUTHORIZED)
          .json(createApiResponse(HttpStatus.UNAUTHORIZED, ResponseMessage.AUTH_REQUIRED));
      }
      const vehicle = await this._createVehicleUseCase.execute(riderId, req.body);
      return res
        .status(HttpStatus.CREATED)
        .json(createApiResponse(HttpStatus.CREATED, "Vehicle added successfully", vehicle));
    } catch (error: any) {
      if (error.message.includes("exists") || error.message.includes("required")) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json(createApiResponse(HttpStatus.BAD_REQUEST, error.message));
      }
      next(error);
    }
  };

  getMyVehicles = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const riderId = req.user?.id;
      if (!riderId) {
        return res
          .status(HttpStatus.UNAUTHORIZED)
          .json(createApiResponse(HttpStatus.UNAUTHORIZED, ResponseMessage.AUTH_REQUIRED));
      }
      const vehicles = await this._getMyVehiclesUseCase.execute(riderId);
      return res
        .status(HttpStatus.OK)
        .json(createApiResponse(HttpStatus.OK, "Vehicles fetched successfully", vehicles));
    } catch (error) {
      next(error);
    }
  };

  getVehicleById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const vehicle = await this._getVehicleByIdUseCase.execute(req.params.id as string);
      if (!vehicle) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json(createApiResponse(HttpStatus.NOT_FOUND, "Vehicle not found"));
      }
      return res
        .status(HttpStatus.OK)
        .json(createApiResponse(HttpStatus.OK, "Vehicle fetched successfully", vehicle));
    } catch (error) {
      next(error);
    }
  };

  updateVehicle = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const riderId = req.user?.id;
      if (!riderId) {
        return res
          .status(HttpStatus.UNAUTHORIZED)
          .json(createApiResponse(HttpStatus.UNAUTHORIZED, ResponseMessage.AUTH_REQUIRED));
      }
      const vehicle = await this._updateVehicleUseCase.execute(
        req.params.id as string,
        riderId,
        req.body,
      );
      return res
        .status(HttpStatus.OK)
        .json(createApiResponse(HttpStatus.OK, "Vehicle updated successfully", vehicle));
    } catch (error: any) {
      if (error.message.includes("authorized")) {
        return res
          .status(HttpStatus.FORBIDDEN)
          .json(createApiResponse(HttpStatus.FORBIDDEN, error.message));
      }
      if (error.message.includes("exists") || error.message.includes("found")) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json(createApiResponse(HttpStatus.BAD_REQUEST, error.message));
      }
      next(error);
    }
  };

  deleteVehicle = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const riderId = req.user?.id;
      if (!riderId) {
        return res
          .status(HttpStatus.UNAUTHORIZED)
          .json(createApiResponse(HttpStatus.UNAUTHORIZED, ResponseMessage.AUTH_REQUIRED));
      }
      await this._deleteVehicleUseCase.execute(req.params.id as string, riderId);
      return res
        .status(HttpStatus.OK)
        .json(createApiResponse(HttpStatus.OK, "Vehicle deleted successfully"));
    } catch (error: any) {
      if (error.message.includes("authorized")) {
        return res
          .status(HttpStatus.FORBIDDEN)
          .json(createApiResponse(HttpStatus.FORBIDDEN, error.message));
      }
      next(error);
    }
  };
}
