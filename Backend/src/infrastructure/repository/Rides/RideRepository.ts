import { IRideRepository } from "../../../application/interfaces/repositories/Ride/IRideRepository";
import { Ride } from "../../../domain/entities/Ride/ride.entities";
import { RideModel } from "../../schema/rideSchema";
import { BaseRepository } from "../BaseRepository/BaseRepository";

export class RideRepository extends BaseRepository<Ride> implements IRideRepository {
  constructor() {
    super(RideModel);
  }
  async create(ride: Omit<Ride, "_id" | "createdAt" | "updatedAt">): Promise<Ride> {
    const doc = await RideModel.create(ride);

    return doc.toObject();
  }

  async findAll(filter?: Partial<Pick<Ride, "status">>): Promise<Ride[]> {
    const query = filter ? filter : {};
    const docs = await RideModel.find(query).sort({ createdAt: -1 });
    return docs.map((d) => d.toObject());
  }

  async findByRider(riderId: string): Promise<Ride[]> {
    const docs = await RideModel.find({ riderId }).sort({ createdAt: -1 });
    return docs.map((d) => d.toObject());
  }

  async updateStatus(id: string, status: Ride["status"]): Promise<void> {
    await RideModel.findByIdAndUpdate(id, { status });
  }

  async delete(id: string): Promise<void> {
    await RideModel.findByIdAndDelete(id);
  }
}
