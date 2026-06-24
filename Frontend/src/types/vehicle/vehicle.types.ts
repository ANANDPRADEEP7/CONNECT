export type VehicleType = "Car" | "SUV" | "Van" | "Hatchback" | "Sedan" | "Other";

export interface Vehicle {
  id: string;
  riderId: string;
  name: string;
  model: string;
  rcNumber: string;
  seats: number;
  images: string[];
  fitnessExpiry: string;
  type: VehicleType;
  color?: string;
  pollutionCertificate?: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface VehiclePayload {
  name: string;
  model: string;
  rcNumber: string;
  seats: number;
  images: string[];
  fitnessExpiry: string;
  type: VehicleType;
  color?: string;
  pollutionCertificate?: string;
  isDefault?: boolean;
}
