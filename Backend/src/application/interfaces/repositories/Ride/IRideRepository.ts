import { Ride } from "../../../../domain/entities/Ride/ride.entities";

/**
 * IRideRepository – Application Layer contract
 * Defines all database operations for rides.
 */
export interface IRideRepository {
  create(ride: Omit<Ride, "_id" | "createdAt" | "updatedAt">): Promise<Ride>;
  findAll(filter?: Partial<Pick<Ride, "status">>): Promise<Ride[]>;
  findByRider(riderId: string): Promise<Ride[]>;
  findById(id: string): Promise<Ride | null>;
  updateStatus(id: string, status: Ride["status"]): Promise<void>;
  delete(id: string): Promise<void>;
}
