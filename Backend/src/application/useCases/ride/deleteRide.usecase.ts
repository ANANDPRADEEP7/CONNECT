import { IRideRepository } from "../../interfaces/repositories/Ride/IRideRepository";

export class DeleteRideUseCase {
  constructor(private readonly _rideRepository: IRideRepository) {}

  async execute(id: string, riderId: string): Promise<void> {
    const existing = await this._rideRepository.findById(id);
    if (!existing) throw new Error("Ride not found");
    if (existing.riderId.toString() !== riderId)
      throw new Error("Not authorized to delete this ride");

    // TODO: Verify that the ride has no active bookings.
    // If it has bookings, throw an error or handle cancellation flow.
    // Since we don't have bookings yet, we can safely delete the ride for now.
    
    await this._rideRepository.delete(id);
  }
}
