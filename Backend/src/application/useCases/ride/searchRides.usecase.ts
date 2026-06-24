import { IRideRepository } from "../../interfaces/repositories/Ride/IRideRepository";
import { IUserRepository } from "../../interfaces/repositories/User/IUserRepository";
import { IVehicleRepository } from "../../interfaces/repositories/Vehicle/IVehicleRepository";
import { Coordinate } from "../../../domain/entities/Ride/ride.entities";
import { RideDTO } from "../../mappers/Ride/RideMapper";

export interface SearchRidesRequest {
  from?: string; // name-based text search for origin
  to?: string; // name-based text search for destination
  date?: string;
  seats?: number;
}

export interface SearchDriverDTO {
  name: string;
  rating: number;
  avatar: string;
  trips: number;
}

export interface SearchRideResponseDTO extends Omit<RideDTO, "riderId" | "vehicleId"> {
  driver: SearchDriverDTO;
  vehicle: string;
}

export class SearchRidesUseCase {
  constructor(
    private readonly _rideRepository: IRideRepository,
    private readonly _userRepository: IUserRepository,
    private readonly _vehicleRepository: IVehicleRepository,
  ) {}

  async execute(query: SearchRidesRequest): Promise<SearchRideResponseDTO[]> {
    const rides = await this._rideRepository.search(query);
    const result: SearchRideResponseDTO[] = [];

    const fromQuery = query.from?.toLowerCase().trim();
    const toQuery = query.to?.toLowerCase().trim();

    for (const ride of rides) {
      let sourceIndex = -1;
      let destIndex = -1;

      // 1. Validate "from" matching origin name or stopover names
      if (fromQuery) {
        if (ride.from.name.toLowerCase().includes(fromQuery)) {
          sourceIndex = -1;
        } else {
          const idx = (ride.stopovers || []).findIndex((s) =>
            s.name.toLowerCase().includes(fromQuery),
          );
          if (idx !== -1) {
            sourceIndex = idx;
          } else {
            continue; // Not matching
          }
        }
      } else {
        sourceIndex = -2;
      }

      // 2. Validate "to" matching destination name or stopover names
      if (toQuery) {
        if (ride.to.name.toLowerCase().includes(toQuery)) {
          destIndex = (ride.stopovers || []).length;
        } else {
          const idx = (ride.stopovers || []).findIndex((s) =>
            s.name.toLowerCase().includes(toQuery),
          );
          if (idx !== -1) {
            destIndex = idx;
          } else {
            continue; // Not matching
          }
        }
      } else {
        destIndex = 99999;
      }

      // 3. Verify chronological order of sequence: source before destination
      if (sourceIndex >= destIndex) {
        continue;
      }

      // 4. Resolve driver and vehicle details
      const driver = await this._userRepository.findById(ride.riderId);
      const vehicle = ride.vehicleId ? await this._vehicleRepository.findById(ride.vehicleId) : null;

      // Deterministic ratings and trip count using hash of driver ID
      const hash = driver?._id
        ? driver._id.toString().split("").reduce((acc: number, val: string) => acc + val.charCodeAt(0), 0)
        : 12;
      const rating = Number((4.5 + (hash % 5) * 0.1).toFixed(1));
      const trips = 20 + (hash % 180);

      const avatar = driver?.name
        ? driver.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .substring(0, 2)
        : "D";

      result.push({
        id: ride._id!.toString(),
        from: ride.from,
        to: ride.to,
        date: ride.date,
        time: ride.time,
        seats: ride.seats,
        pricePerSeat: ride.pricePerSeat,
        description: ride.description || "",
        status: ride.status as "active" | "completed" | "cancelled",
        createdAt: ride.createdAt,
        updatedAt: ride.updatedAt,
        stopovers: ride.stopovers,
        distance: ride.distance,
        duration: ride.duration,
        vehicle: vehicle ? `${vehicle.name} (${vehicle.color || "White"})` : "Standard Vehicle",
        driver: {
          name: driver?.name || "Verified Driver",
          rating,
          avatar,
          trips,
        },
      });
    }

    return result;
  }
}
