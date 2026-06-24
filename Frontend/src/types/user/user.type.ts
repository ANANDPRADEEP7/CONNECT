export interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "rider" | "admin";
  isBlocked: boolean;
  createdAt: string;
}