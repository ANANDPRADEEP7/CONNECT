import mongoose, { HydratedDocument, Model, Schema } from "mongoose";
import { User } from "../../domain/entities/User/user.entities";

export type UserDocument = HydratedDocument<User>;

const UserSchema = new Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "rider", "admin"],
      default: "user",
    },
    phonenumber: {
      type: String,
    },
    password: {
      type: String,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isRiderActive: {
      type: String,
      enum: ["active", "pending", "declined", "none"],
      default: "none",
    },
    bio: {
      type: String,
    },
    // File URL paths stored as strings, e.g. /uploads/1234567890-abc.jpg
    govId: {
      type: String,
    },
    vehicleImage: {
      type: String,
    },
    pucImage: {
      type: String,
    },
    rcImage: {
      type: String,
    },
  },
  { timestamps: true },
);

export const UserModel: Model<UserDocument> = mongoose.model<UserDocument>("User", UserSchema);
