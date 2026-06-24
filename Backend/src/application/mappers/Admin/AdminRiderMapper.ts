import { User } from "../../../domain/entities/User/user.entities";
import { Vehicle } from "../../../domain/entities/Vehicle/vehicle.entity";
import { GetAllRidersResponse } from "../../interfaces/usecases/Admin/getAllRiders.usecase.interface";

export class AdminRiderMapper {
  static toAdminRiderDTO(user: User, vehicles: Vehicle[] = []): GetAllRidersResponse {
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
      rejectionReason: user.rejectionReason,
      vehicles: vehicles.map((v) => ({
        id: v._id as string,
        name: v.name,
        model: v.model,
        color: v.color,
        capacity: v.seats,
        rcNumber: v.rcNumber,
        type: v.type,
        images: v.images,
      })),
    };
  }
}
