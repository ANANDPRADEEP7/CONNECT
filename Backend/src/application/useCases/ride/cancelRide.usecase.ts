import { IRideRepository } from "../../interfaces/repositories/Ride/IRideRepository";

export class CancelRideUseCase {
  constructor(private readonly _rideRepository: IRideRepository) {}

  async execute(id: string, riderId: string, reason: string): Promise<void> {
    const existing = await this._rideRepository.findById(id);
    if (!existing) throw new Error("Ride not found");
    if (existing.riderId.toString() !== riderId)
      throw new Error("Not authorized to cancel this ride");
    if (existing.status === "cancelled") throw new Error("Ride is already cancelled");
    if (existing.status === "completed") throw new Error("Cannot cancel a completed ride");
    
    await this._rideRepository.update(id, {
      status: "cancelled",
      cancellation: {
        cancelledBy: "Driver",
        reason,
        timestamp: new Date()
      }
    });
  }
}
