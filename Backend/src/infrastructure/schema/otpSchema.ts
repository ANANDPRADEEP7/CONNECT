import mongoose, { Schema, Model, HydratedDocument } from "mongoose";
import { OtpData } from "../../domain/entities/User/Otp.entities";

export type OtpDocument = HydratedDocument<OtpData>;

const OtpSchema = new Schema<OtpDocument>(
  {
    name: {
      type: String,
      // required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      index: true,
      lowercase: true,
    },
    phonenumber: {
      type: String,
      // required: true,
    },
    password: {
      type: String,
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 300, // ⏱️ auto delete after 5 minutes
    },
  },
  { timestamps: false },
);

export const OtpModel: Model<OtpDocument> = mongoose.model<OtpDocument>("Otp", OtpSchema);
