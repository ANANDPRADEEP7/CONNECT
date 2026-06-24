import mongoose, { HydratedDocument, Model, Schema } from "mongoose";
import { Booking } from "../../domain/entities/Booking/booking.entities";

export type BookingDocument = HydratedDocument<Booking>;

const BookingSchema = new Schema(
  {
    rideId: {
      type: Schema.Types.ObjectId,
      ref: "Ride",
      required: true,
    },
    passengerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    driverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    seatsBooked: {
      type: Number,
      required: true,
      min: 1,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export const BookingModel: Model<BookingDocument> = mongoose.model<BookingDocument>("Booking", BookingSchema);
