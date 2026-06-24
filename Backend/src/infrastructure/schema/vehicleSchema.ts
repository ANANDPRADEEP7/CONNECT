import mongoose, { HydratedDocument, Model, Schema } from "mongoose";
import { Vehicle } from "../../domain/entities/Vehicle/vehicle.entity";

export type VehicleDocument = HydratedDocument<Vehicle>;

const VehicleSchema = new Schema(
  {
    riderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    model: {
      type: String,
      required: true,
    },
    rcNumber: {
      type: String,
      required: true,
      unique: true,
    },
    seats: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },
    images: {
      type: [String],
      default: [],
    },
    fitnessExpiry: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["Car", "SUV", "Van", "Hatchback", "Sedan", "Other"],
    },
    color: {
      type: String,
    },
    pollutionCertificate: {
      type: String,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export const VehicleModel: Model<VehicleDocument> = mongoose.model<VehicleDocument>(
  "Vehicle",
  VehicleSchema,
);
