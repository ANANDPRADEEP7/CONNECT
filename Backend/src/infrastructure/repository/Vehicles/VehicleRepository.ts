import { IVehicleRepository } from "../../../application/interfaces/repositories/Vehicle/IVehicleRepository";
import { Vehicle } from "../../../domain/entities/Vehicle/vehicle.entity";
import { VehicleModel } from "../../schema/vehicleSchema";
import { BaseRepository } from "../BaseRepository/BaseRepository";

export class VehicleRepository extends BaseRepository<Vehicle> implements IVehicleRepository {
  constructor() {
    super(VehicleModel as any);
  }

  async create(vehicle: Omit<Vehicle, "_id" | "createdAt" | "updatedAt">): Promise<Vehicle> {
    const doc = await VehicleModel.create(vehicle);
    return doc.toObject();
  }

  async findById(id: string): Promise<Vehicle | null> {
    const doc = await VehicleModel.findById(id);
    return doc ? doc.toObject() : null;
  }

  async findByRider(riderId: string): Promise<Vehicle[]> {
    const docs = await VehicleModel.find({ riderId }).sort({ createdAt: -1 });
    return docs.map((d) => d.toObject());
  }

  async findByRcNumber(rcNumber: string): Promise<Vehicle | null> {
    const doc = await VehicleModel.findOne({ rcNumber });
    return doc ? doc.toObject() : null;
  }

  async update(
    id: string,
    data: Partial<Omit<Vehicle, "_id" | "riderId" | "createdAt" | "updatedAt">>,
  ): Promise<Vehicle | null> {
    const doc = await VehicleModel.findByIdAndUpdate(id, data, { new: true });
    return doc ? doc.toObject() : null;
  }

  async delete(id: string): Promise<void> {
    await VehicleModel.findByIdAndDelete(id);
  }

  async unsetDefault(riderId: string): Promise<void> {
    await VehicleModel.updateMany({ riderId }, { isDefault: false });
  }
}
