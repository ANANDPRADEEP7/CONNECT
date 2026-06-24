import { IVehicleRepository } from "../../interfaces/repositories/Vehicle/IVehicleRepository";
import { VehicleDTO, VehicleMapper } from "../../mappers/Vehicle/VehicleMapper";

export interface CreateVehicleRequest {
  name: string;
  model: string;
  rcNumber: string;
  seats: number;
  images: string[];
  fitnessExpiry: string;
  type: string;
  color?: string;
  pollutionCertificate?: string;
  isDefault?: boolean;
}

export class CreateVehicleUseCase {
  constructor(private readonly _vehicleRepository: IVehicleRepository) {}

  async execute(riderId: string, data: CreateVehicleRequest): Promise<VehicleDTO> {
    if (!data.name || !data.model || !data.rcNumber || !data.type || !data.fitnessExpiry) {
      throw new Error("Missing required vehicle fields");
    }

    if (data.seats < 1 || data.seats > 8) {
      throw new Error("Vehicle seating capacity must be between 1 and 8 seats");
    }

    const cleanRc = data.rcNumber.toUpperCase().replace(/[\s-]/g, "");
    const standardRegex = /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{4}$/;
    const bhRegex = /^[0-9]{2}BH[0-9]{4}[A-Z]{1,2}$/;
    if (!standardRegex.test(cleanRc) && !bhRegex.test(cleanRc)) {
      throw new Error("Invalid registration number format. Expected format like MH12AB1234 or 22BH1234A");
    }

    const fitnessDate = new Date(data.fitnessExpiry);
    if (isNaN(fitnessDate.getTime())) {
      throw new Error("Invalid fitness expiry date");
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (fitnessDate <= today) {
      throw new Error("Fitness certificate has expired or is invalid. Expiry date must be in the future.");
    }

    const existing = await this._vehicleRepository.findByRcNumber(cleanRc);
    if (existing) {
      throw new Error("Vehicle with this registration number already exists");
    }

    if (data.isDefault) {
      await this._vehicleRepository.unsetDefault(riderId);
    }

    const vehicle = await this._vehicleRepository.create({
      riderId,
      name: data.name.trim(),
      model: data.model.trim(),
      rcNumber: cleanRc,
      seats: data.seats,
      images: data.images || [],
      fitnessExpiry: fitnessDate,
      type: data.type,
      color: data.color?.trim(),
      pollutionCertificate: data.pollutionCertificate?.trim(),
      isDefault: data.isDefault || false,
    });

    return VehicleMapper.toVehicleDTO(vehicle);
  }
}
