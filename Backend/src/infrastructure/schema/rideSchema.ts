import mongoose, { HydratedDocument, Model, Schema } from "mongoose";
import { Ride } from "../../domain/entities/Ride/ride.entities";

export type RideDocument = HydratedDocument<Ride>;

/** Sub-schema for a Coordinate object */
const CoordinateSchema = {
  name: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
};

const RideSchema = new Schema(
  {
    riderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    from: {
      type: CoordinateSchema,
      required: true,
    },
    to: {
      type: CoordinateSchema,
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
    vehicleId: {
      type: Schema.Types.ObjectId,
      ref: "Vehicle",
    },
    status: {
      type: String,
      enum: ["active", "completed", "cancelled", "suspended"],
      default: "active",
    },
    stopovers: {
      type: [
        {
          id: { type: String, required: true },
          name: { type: String, required: true },
          coords: { type: CoordinateSchema, required: true },
          price: { type: Number },
        },
      ],
      default: [],
    },
    distance: {
      type: String,
    },
    duration: {
      type: String,
    },
    cancellation: {
      cancelledBy: { type: String, enum: ["Driver", "Passenger", "Admin"] },
      reason: { type: String },
      timestamp: { type: Date }
    },
    bookingMode: {
      type: String,
      enum: ["instant", "review"],
      default: "instant",
    },
  },
  { timestamps: true },
);

export const RideModel: Model<RideDocument> = mongoose.model<RideDocument>("Ride", RideSchema);
