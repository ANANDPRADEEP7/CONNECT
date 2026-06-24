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

  async findById(id: string): Promise<Ride | null> {
    const doc = await RideModel.findById(id);
    return doc ? doc.toObject() : null;
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

  async update(
    id: string,
    data: Partial<Omit<Ride, "_id" | "riderId" | "createdAt" | "updatedAt">>,
  ): Promise<Ride | null> {
    const doc = await RideModel.findByIdAndUpdate(id, data, { new: true });
    return doc ? doc.toObject() : null;
  }

  async updateStatus(id: string, status: Ride["status"]): Promise<void> {
    await RideModel.findByIdAndUpdate(id, { status });
  }

  /**
   * Search rides by text matching on from.name / to.name / stopovers.name,
   * with optional date and seat count filters.
   */
  async search(query: { from?: string; to?: string; date?: string; seats?: number }): Promise<Ride[]> {
    const filter: any = { status: "active" };

    if (query.date) {
      filter.date = query.date;
    }

    if (query.seats) {
      filter.seats = { $gte: Number(query.seats) };
    }

    const clauses: any[] = [];

    if (query.from) {
      const fromRegex = new RegExp(query.from.trim(), "i");
      clauses.push({
        $or: [
          { "from.name": fromRegex },
          { "stopovers.name": fromRegex },
        ],
      });
    }

    if (query.to) {
      const toRegex = new RegExp(query.to.trim(), "i");
      clauses.push({
        $or: [
          { "to.name": toRegex },
          { "stopovers.name": toRegex },
        ],
      });
    }

    if (clauses.length > 0) {
      filter.$and = clauses;
    }

    const docs = await RideModel.find(filter).sort({ date: 1, time: 1 });
    return docs.map((d) => d.toObject());
  }

  async delete(id: string): Promise<void> {
    await RideModel.findByIdAndDelete(id);
  }
}
