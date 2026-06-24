import { IRideRepository } from "../../interfaces/repositories/Ride/IRideRepository";
import { Ride } from "../../../domain/entities/Ride/ride.entities";

export type UpdateRideData = Partial<Omit<Ride, "_id" | "riderId" | "createdAt" | "updatedAt">>;

export class UpdateRideUseCase {
  constructor(private readonly _rideRepository: IRideRepository) {}

  async execute(id: string, riderId: string, data: UpdateRideData): Promise<Ride | null> {
    const existing = await this._rideRepository.findById(id);
    if (!existing) throw new Error("Ride not found");
    if (existing.riderId.toString() !== riderId)
      throw new Error("Not authorized to edit this ride");
    if (existing.status === "completed" || existing.status === "cancelled") {
      throw new Error("Cannot edit a completed or cancelled ride");
    }
    return this._rideRepository.update(id, data);
  }
}
