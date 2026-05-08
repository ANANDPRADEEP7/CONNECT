export interface UpdateRiderStatusResponse {
  message: string;
  isRiderActive: "active" | "declined";
  riderId: string;
}

export interface IUpdateRiderStatusUseCase {
  execute(
    userId: string,
    status: "active" | "declined"
  ): Promise<UpdateRiderStatusResponse>;
}