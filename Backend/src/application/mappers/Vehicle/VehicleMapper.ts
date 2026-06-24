import { Vehicle } from "../../../domain/entities/Vehicle/vehicle.entity";

export interface VehicleDTO {
  id: string;
  riderId: string;
  name: string;
  model: string;
  rcNumber: string;
  seats: number;
  images: string[];
  fitnessExpiry: Date | string;
  type: string;
  color?: string;
  pollutionCertificate?: string;
  isDefault: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class VehicleMapper {
  static toVehicleDTO(vehicle: Vehicle): VehicleDTO {
    return {
      id: vehicle._id!.toString(),
      riderId: vehicle.riderId.toString(),
      name: vehicle.name,
      model: vehicle.model,
      rcNumber: vehicle.rcNumber,
      seats: vehicle.seats,
      images: vehicle.images,
      fitnessExpiry: vehicle.fitnessExpiry,
      type: vehicle.type,
      color: vehicle.color,
      pollutionCertificate: vehicle.pollutionCertificate,
      isDefault: vehicle.isDefault,
      createdAt: vehicle.createdAt,
      updatedAt: vehicle.updatedAt,
    };
  }

  static toVehicleDTOList(vehicles: Vehicle[]): VehicleDTO[] {
    return vehicles.map((v) => VehicleMapper.toVehicleDTO(v));
  }
}
