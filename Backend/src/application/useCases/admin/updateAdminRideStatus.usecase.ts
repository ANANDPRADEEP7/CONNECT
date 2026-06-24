import { IRideRepository } from "../../interfaces/repositories/Ride/IRideRepository";
import { IUpdateAdminRideStatusUseCase } from "../../interfaces/usecases/Admin/updateAdminRideStatus.usecase.interface";
import { Ride } from "../../../domain/entities/Ride/ride.entities";

export class UpdateAdminRideStatusUseCase implements IUpdateAdminRideStatusUseCase {
  constructor(private readonly _rideRepository: IRideRepository) {}

  async execute(id: string, status: "active" | "completed" | "cancelled" | "suspended", reason?: string): Promise<void> {
    if (status === "cancelled") {
      await this._rideRepository.update(id, {
        status,
        cancellation: {
          cancelledBy: "Admin",
          reason: reason || "Cancelled by Admin",
          timestamp: new Date()
        }
      });
    } else {
      await this._rideRepository.updateStatus(id, status as Ride["status"]);
    }
  }
}
