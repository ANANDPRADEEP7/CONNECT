export interface IDeleteAdminRideUseCase {
  execute(id: string): Promise<void>;
}
