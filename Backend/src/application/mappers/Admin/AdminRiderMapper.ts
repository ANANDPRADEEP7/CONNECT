import { User } from "../../../domain/entities/User/user.entities";
import { GetAllRidersResponse } from "../../interfaces/usecases/Admin/getAllRiders.usecase.interface";

export class AdminRiderMapper {
  static toAdminRiderDTO(user: User): GetAllRidersResponse {
    return {
      id: user._id as string,
      name: user.name,
      email: user.email,
      phone: user.phonenumber || "N/A",
      status:
        user.isRiderActive === "active"
          ? "approved"
          : user.isRiderActive === "declined"
            ? "rejected"
            : "pending",
      bio: user.bio,
      govId: user.govId,
      vehicleImage: user.vehicleImage,
      pucImage: user.pucImage,
      rcImage: user.rcImage,
    };
  }

  static toAdminRiderDTOList(users: User[]): GetAllRidersResponse[] {
    return users.map((user) => AdminRiderMapper.toAdminRiderDTO(user));
  }
}
