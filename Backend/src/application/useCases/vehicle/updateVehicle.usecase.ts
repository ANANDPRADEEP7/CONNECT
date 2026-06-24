import { IVehicleRepository } from "../../interfaces/repositories/Vehicle/IVehicleRepository";
import { VehicleDTO, VehicleMapper } from "../../mappers/Vehicle/VehicleMapper";

export interface UpdateVehicleData {
  name?: string;
  model?: string;
  rcNumber?: string;
  seats?: number;
  images?: string[];
  fitnessExpiry?: string | Date;
  type?: string;
  color?: string;
  pollutionCertificate?: string;
  isDefault?: boolean;
}

export class UpdateVehicleUseCase {
  constructor(private readonly _vehicleRepository: IVehicleRepository) {}

  async execute(id: string, riderId: string, data: UpdateVehicleData): Promise<VehicleDTO> {
    const existing = await this._vehicleRepository.findById(id);
    if (!existing) throw new Error("Vehicle not found");
    if (existing.riderId.toString() !== riderId) {
      throw new Error("Not authorized to update this vehicle");
    }

    if (data.seats !== undefined && (data.seats < 1 || data.seats > 8)) {
      throw new Error("Vehicle seating capacity must be between 1 and 8 seats");
    }

    let cleanRc = undefined;
    if (data.rcNumber) {
      cleanRc = data.rcNumber.toUpperCase().replace(/[\s-]/g, "");
      const standardRegex = /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{4}$/;
      const bhRegex = /^[0-9]{2}BH[0-9]{4}[A-Z]{1,2}$/;
      if (!standardRegex.test(cleanRc) && !bhRegex.test(cleanRc)) {
        throw new Error("Invalid registration number format. Expected format like MH12AB1234 or 22BH1234A");
      }

      if (cleanRc !== existing.rcNumber) {
        const existingRc = await this._vehicleRepository.findByRcNumber(cleanRc);
        if (existingRc) {
          throw new Error("Vehicle with this registration number already exists");
        }
      }
    }

    let fitnessDate = undefined;
    if (data.fitnessExpiry) {
      fitnessDate = new Date(data.fitnessExpiry);
      if (isNaN(fitnessDate.getTime())) {
        throw new Error("Invalid fitness expiry date");
      }
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (fitnessDate <= today) {
        throw new Error("Fitness certificate has expired or is invalid. Expiry date must be in the future.");
      }
    }

    if (data.isDefault) {
      await this._vehicleRepository.unsetDefault(riderId);
    }

    const payload = {
      ...data,
      ...(cleanRc ? { rcNumber: cleanRc } : {}),
      ...(fitnessDate ? { fitnessExpiry: fitnessDate } : {}),
    };

    const updated = await this._vehicleRepository.update(id, payload);
    return VehicleMapper.toVehicleDTO(updated!);
  }
}
