import { NextFunction, Response } from "express";
import { AuthRequest } from "../../middleware/AuthMiddleware";
import { HttpStatus } from "../../../domain/enums/HttpStatus.enum";
import { ResponseMessage } from "../../../domain/enums/ResponseMessage.enum";
import { ICreateRideUseCase } from "../../../application/interfaces/usecases/Rider/createRide.usecase.interface";
import { IGetRidesUseCase } from "../../../application/interfaces/usecases/Rider/getRides.usecase.interface";
import { IGetMyRidesUseCase } from "../../../application/interfaces/usecases/Rider/getMyRides.usecase.interface";


export class RideController {
  constructor(
    private readonly createRideUseCase: ICreateRideUseCase,
    private readonly getRidesUseCase: IGetRidesUseCase,
    private readonly getMyRidesUseCase: IGetMyRidesUseCase
  ) {}


createRide = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const riderId = req.user?.id;

    if (!riderId) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({
          message: ResponseMessage.AUTH_REQUIRED,
        });
    }

    const {
      from,
      to,
      date,
      time,
      seats,
      pricePerSeat,
      description,
    } = req.body;

    const response = await this.createRideUseCase.execute(
      riderId,
      {
        from,
        to,
        date,
        time,
        seats: Number(seats),
        pricePerSeat: Number(pricePerSeat),
        description,
      }
    );

    return res
      .status(HttpStatus.CREATED)
      .json(response);

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
