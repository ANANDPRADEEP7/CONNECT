import mongoose, { HydratedDocument, Model, Schema } from "mongoose";
import { User } from "../../domain/entities/User/user.entities";
import { UserRole, RiderStatus } from "../../domain/enums/UserRole.enum";

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
      enum: Object.values(UserRole),
      default: UserRole.USER,
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
      enum: Object.values(RiderStatus),
      default: RiderStatus.NONE,
    },
    bio: {
      type: String,
    },
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
    rejectionReason: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

export const UserModel: Model<UserDocument> = mongoose.model<UserDocument>("User", UserSchema);
