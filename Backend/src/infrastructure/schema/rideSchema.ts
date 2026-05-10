import mongoose, { HydratedDocument, Model, Schema } from "mongoose";
import { Ride } from "../../domain/entities/Ride/ride.entities";

export type RideDocument = HydratedDocument<Ride>;

const RideSchema = new Schema(
  {
    riderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    from: {
      type: String,
      required: true,
    },
    to: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    seats: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },
    pricePerSeat: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
    },
  },
  { timestamps: true },
);

export const RideModel: Model<RideDocument> = mongoose.model<RideDocument>("Ride", RideSchema);
