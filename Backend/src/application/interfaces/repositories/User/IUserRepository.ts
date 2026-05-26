import { OtpData } from "../../../../domain/entities/User/Otp.entities";
import type { User } from "../../../../domain/entities/User/user.entities";
import { IBaseRepository } from "../BaseRepository/IBaseRepository";

export interface IUserRepository extends IBaseRepository<User> {
  findByEmail(email: string): Promise<User | null>;
  findByEmailFromDB(email: string): Promise<User | null>;
  create(user: Partial<User>): Promise<User>;
  update(id: string, data: Partial<User>): Promise<void>;
  storeOtp(data: Partial<OtpData>): Promise<void>;
  getOtp(email: string): Promise<OtpData | null>;
  deleteOtp(email: string): Promise<void>;
  findAll(): Promise<User[]>;
  findPaginatedUsers(
    page: number,
    limit: number,
    search?: string,
    filter?: string,
  ): Promise<{ data: User[]; total: number }>;
  findPaginatedRiders(
    page: number,
    limit: number,
    search?: string,
    filter?: string,
  ): Promise<{ data: User[]; total: number }>;
}
