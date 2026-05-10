// interfaces/usecases/Rider/getRides.usecase.interface.ts

export interface GetRidesResponse {
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

export interface IGetRidesUseCase {
  execute(): Promise<GetRidesResponse[]>;
}
