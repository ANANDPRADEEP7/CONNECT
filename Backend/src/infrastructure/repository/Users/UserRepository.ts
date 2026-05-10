import { IUserRepository } from "../../../application/interfaces/repositories/User/IUserRepository";
import { OtpData } from "../../../domain/entities/User/Otp.entities";
import { User } from "../../../domain/entities/User/user.entities";
import { OtpModel } from "../../schema/otpSchema";
import { UserModel } from "../../schema/userSchema";
import { BaseRepository } from "../BaseRepository/BaseRepository";

export class UserRepository extends BaseRepository<User> implements IUserRepository {
  constructor() {
    super(UserModel);
  }
  async findByEmail(email: string): Promise<User | null> {
    const user = await UserModel.findOne({ email });
    return user ? user.toObject() : null;
  }

  async findByEmailFromDB(email: string): Promise<User | null> {
    const user = await UserModel.findOne({ email });
    return user ? user.toObject() : null;
  }

  async create(user: Partial<User>): Promise<User> {
    const userData = new UserModel(user);
    const data = await userData.save();
    return data.toObject();
  }

  async storeOtp(data: Partial<OtpData>): Promise<void> {
    console.log("dataaaaaaa", data);
    const Otp = new OtpModel(data);
    await Otp.save();
  }

  async getOtp(email: string): Promise<OtpData | null> {
    const otp = await OtpModel.findOne({ email });
    return otp;
  }

  async update(id: string, data: Partial<User>): Promise<void> {
    console.log("Saving to database for user ID:", id);
    console.log("Data to save:", data);

    const updatedUser = await UserModel.findByIdAndUpdate(id, data, { new: true });

    if (!updatedUser) {
      throw new Error(`Failed to update: User with ID ${id} not found in database.`);
    }

    console.log("Successfully updated user:", updatedUser);
  }
  async deleteOtp(email: string): Promise<void> {
    await OtpModel.deleteOne({ email });
  }

  async findAll(): Promise<User[]> {
    const users = await UserModel.find();
    return users.map((user) => user.toObject());
  }

  async findPaginatedUsers(page: number, limit: number): Promise<{ data: User[]; total: number }> {
    const skip = (page - 1) * limit;
    const query = { role: { $ne: "admin" } };
    const total = await UserModel.countDocuments(query);
    const users = await UserModel.find(query).skip(skip).limit(limit).exec();
    return { data: users.map((user) => user.toObject()), total };
  }

  async findPaginatedRiders(page: number, limit: number): Promise<{ data: User[]; total: number }> {
    const skip = (page - 1) * limit;
    const query = { isRiderActive: { $in: ["active", "pending", "declined"] } };
    const total = await UserModel.countDocuments(query);
    const users = await UserModel.find(query).skip(skip).limit(limit).exec();
    return { data: users.map((user) => user.toObject()), total };
  }
}
