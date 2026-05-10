export interface GetMyRidesResponse {
  id: string;
  riderId: string;
  from: string;
  to: string;
  date: string;
  time: string;
  seats: number;
  pricePerSeat: number;
  description?: string;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IGetMyRidesUseCase {
  execute(riderId: string): Promise<GetMyRidesResponse[]>;
}
