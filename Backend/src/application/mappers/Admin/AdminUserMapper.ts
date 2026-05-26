import { User } from "../../../domain/entities/User/user.entities";

export interface AdminUserDTO {
  id: string;
  name: string;
  email: string;
  phone: string;
  verified: boolean;
  blocked: boolean;
}

export class AdminUserMapper {
  static toAdminUserDTO(user: User): AdminUserDTO {
    return {
      id: user._id as string,
      name: user.name,
      email: user.email,
      phone: user.phonenumber || "N/A",
      verified: user.isVerified || false,
      blocked: user.isBlocked,
    };
  }

  static toAdminUserDTOList(users: User[]): AdminUserDTO[] {
    return users.map((user) => AdminUserMapper.toAdminUserDTO(user));
  }
}
