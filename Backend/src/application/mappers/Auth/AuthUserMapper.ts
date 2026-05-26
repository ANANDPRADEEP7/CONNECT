import { User } from "../../../domain/entities/User/user.entities";

export interface AuthUserDTO {
  id: string;
  name: string;
  email: string;
  role: string;
  isRiderActive: string | undefined;
  isBlocked: boolean;
  phonenumber: string;
  bio?: string;
  govId?: string;
  vehicleImage?: string;
  pucImage?: string;
  rcImage?: string;
  rejectionReason?: string | null;
}

export class AuthUserMapper {
  static toAuthUserDTO(user: User): AuthUserDTO {
    return {
      id: user._id as string,
      name: user.name,
      email: user.email,
      role: user.role,
      isRiderActive: user.isRiderActive,
      isBlocked: user.isBlocked,
      phonenumber: user.phonenumber || "",
      bio: user.bio,
      govId: user.govId,
      vehicleImage: user.vehicleImage,
      pucImage: user.pucImage,
      rcImage: user.rcImage,
      rejectionReason: user.rejectionReason,
    };
  }
}
