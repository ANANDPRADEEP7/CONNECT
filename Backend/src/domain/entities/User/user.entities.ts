import { UserRole, RiderStatus } from "../../enums/UserRole.enum";

export interface User {
  _id: string;
  name: string;
  email: string;
  phonenumber: string;
  role: UserRole;
  password: string;
  isBlocked: boolean;
  isVerified?: boolean;
  isRiderActive?: RiderStatus;
  bio?: string;
  govId?: string;
  vehicleImage?: string;
  pucImage?: string;
  rcImage?: string;
  rejectionReason?: string | null;
}
