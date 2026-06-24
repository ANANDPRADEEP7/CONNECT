export interface IUpdateAdminRideStatusUseCase {
  execute(id: string, status: "active" | "completed" | "cancelled" | "suspended", reason?: string): Promise<void>;
}
