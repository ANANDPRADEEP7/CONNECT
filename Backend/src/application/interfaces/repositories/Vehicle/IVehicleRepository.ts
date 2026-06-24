import { Vehicle } from "../../../../domain/entities/Vehicle/vehicle.entity";
import { IBaseRepository } from "../BaseRepository/IBaseRepository";

export interface IVehicleRepository extends IBaseRepository<Vehicle> {
  create(vehicle: Omit<Vehicle, "_id" | "createdAt" | "updatedAt">): Promise<Vehicle>;
  findById(id: string): Promise<Vehicle | null>;
  findByRider(riderId: string): Promise<Vehicle[]>;
  findByRcNumber(rcNumber: string): Promise<Vehicle | null>;
  update(
    id: string,
    data: Partial<Omit<Vehicle, "_id" | "riderId" | "createdAt" | "updatedAt">>,
  ): Promise<Vehicle | null>;
  delete(id: string): Promise<void>;
  unsetDefault(riderId: string): Promise<void>;
}
