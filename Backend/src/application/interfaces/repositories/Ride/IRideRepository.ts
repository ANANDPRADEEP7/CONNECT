import { Ride } from "../../../../domain/entities/Ride/ride.entities";
import { IBaseRepository } from "../BaseRepository/IBaseRepository";

export interface IRideRepository extends IBaseRepository<Ride> {
  create(ride: Omit<Ride, "_id" | "createdAt" | "updatedAt">): Promise<Ride>;
  findAll(filter?: Partial<Pick<Ride, "status">>): Promise<Ride[]>;
  findByRider(riderId: string): Promise<Ride[]>;
  updateStatus(id: string, status: Ride["status"]): Promise<void>;
  delete(id: string): Promise<void>;
}

