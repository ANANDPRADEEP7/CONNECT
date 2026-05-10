type userType = "user" | "admin" | "rider";

export interface User {
  _id: string;
  name: string;
  email: string;
  phonenumber: string;
  role: userType;
  password: string;
  isBlocked: boolean;
  isVerified?: boolean;
  isRiderActive?: string; // "none" | "pending" | "active" | "declined"
  bio?: string;
  govId?: string; // Stored as URL path, e.g. /uploads/filename.jpg
  vehicleImage?: string;
  pucImage?: string;
  rcImage?: string;
}
