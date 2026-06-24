import { Ride } from "../../../../domain/entities/Ride/ride.entities";
import { IBaseRepository } from "../BaseRepository/IBaseRepository";

export interface IRideRepository extends IBaseRepository<Ride> {
  create(ride: Omit<Ride, "_id" | "createdAt" | "updatedAt">): Promise<Ride>;
  findById(id: string): Promise<Ride | null>;
  findAll(filter?: Partial<Pick<Ride, "status">>): Promise<Ride[]>;
  findByRider(riderId: string): Promise<Ride[]>;
  update(
    id: string,
    data: Partial<Omit<Ride, "_id" | "riderId" | "createdAt" | "updatedAt">>,
  ): Promise<Ride | null>;
  updateStatus(id: string, status: Ride["status"]): Promise<void>;
  /** Text-based search on location names, date, and seats */
  search(query: { from?: string; to?: string; date?: string; seats?: number }): Promise<Ride[]>;
  delete(id: string): Promise<void>;
}
