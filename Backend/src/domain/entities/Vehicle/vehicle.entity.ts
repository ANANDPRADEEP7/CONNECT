export interface Vehicle {
  _id?: string;
  riderId: string;
  name: string;
  model: string;
  rcNumber: string;
  seats: number;
  images: string[];
  fitnessExpiry: string | Date;
  type: string;
  color?: string;
  pollutionCertificate?: string;
  isDefault: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
