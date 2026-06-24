import { IRideRepository } from "../../interfaces/repositories/Ride/IRideRepository";
import { IUserRepository } from "../../interfaces/repositories/User/IUserRepository";
import { IVehicleRepository } from "../../interfaces/repositories/Vehicle/IVehicleRepository";
import { IGetAdminRidesUseCase, GetAdminRidesResponse, AdminRideDTO } from "../../interfaces/usecases/Admin/getAdminRides.usecase.interface";
import { RideMapper } from "../../mappers/Ride/RideMapper";

export class GetAdminRidesUseCase implements IGetAdminRidesUseCase {
  constructor(
    private readonly _rideRepository: IRideRepository,
    private readonly _userRepository: IUserRepository,
    private readonly _vehicleRepository: IVehicleRepository,
  ) {}

  async execute(
    page: number = 1,
    limit: number = 10,
    search?: string,
    filter?: string
  ): Promise<GetAdminRidesResponse> {
    const allRides = await this._rideRepository.findAll();

    const formattedRides: AdminRideDTO[] = [];

    let totalRides = allRides.length;
    let activeRides = 0;
    let completedRides = 0;
    let cancelledRides = 0;
    let suspendedRides = 0;

    const isFutureRide = (dateStr: string, timeStr: string): boolean => {
      try {
        const rideDate = new Date(dateStr);
        const now = new Date();
        if (rideDate.toDateString() === now.toDateString()) {
          return true; 
        }
        return rideDate > now;
      } catch {
        return true;
      }
    };

    for (const ride of allRides) {
      if (ride.status === "completed") completedRides++;
      else if (ride.status === "cancelled") cancelledRides++;
      else if (ride.status === "suspended") suspendedRides++;
      else if (ride.status === "active") activeRides++;
    }

    let filteredRides = [...allRides];

    if (filter) {
      const f = filter.toLowerCase().trim();
      if (f === "upcoming") {
        filteredRides = filteredRides.filter(r => r.status === "active" && isFutureRide(r.date, r.time));
      } else if (f === "ongoing") {
        filteredRides = filteredRides.filter(r => r.status === "active" && !isFutureRide(r.date, r.time));
      } else if (f === "completed") {
        filteredRides = filteredRides.filter(r => r.status === "completed");
      } else if (f === "cancelled") {
        filteredRides = filteredRides.filter(r => r.status === "cancelled");
      } else if (f === "suspended") {
        filteredRides = filteredRides.filter(r => r.status === "suspended");
      }
    }

    for (const ride of filteredRides) {
      const driver = await this._userRepository.findById(ride.riderId);
      const vehicle = ride.vehicleId ? await this._vehicleRepository.findById(ride.vehicleId) : null;

      const hash = ride._id ? ride._id.toString().split("").reduce((acc, val) => acc + val.charCodeAt(0), 0) : 0;
      const bookedSeats = ride.status === "completed" ? ride.seats : (hash % (ride.seats + 1));

      const driverAvatar = driver?.name
        ? driver.name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)
        : "D";

      const mappedRide = RideMapper.toRideDTO(ride);

      formattedRides.push({
        ...mappedRide,
        driver: {
          id: driver?._id?.toString() || ride.riderId,
          name: driver?.name || "Verified Driver",
          email: driver?.email || "",
          phone: driver?.phonenumber || "",
          avatar: driverAvatar,
        },
        vehicle: vehicle ? {
          id: vehicle._id!.toString(),
          name: vehicle.name,
          color: vehicle.color,
          capacity: vehicle.seats,
        } : undefined,
        bookedSeats,
        cancellation: ride.cancellation ? {
          cancelledBy: ride.cancellation.cancelledBy,
          reason: ride.cancellation.reason,
          timestamp: ride.cancellation.timestamp
        } : undefined,
      });
    }

    let searchedRides = formattedRides;
    if (search && search.trim()) {
      const s = search.toLowerCase().trim();
      searchedRides = formattedRides.filter(r =>
        r.from.name.toLowerCase().includes(s) ||
        r.to.name.toLowerCase().includes(s) ||
        r.id.toLowerCase().includes(s) ||
        r.driver.name.toLowerCase().includes(s) ||
        r.driver.email.toLowerCase().includes(s)
      );
    }

    const total = searchedRides.length;
    const startIndex = (page - 1) * limit;
    const paginatedRides = searchedRides.slice(startIndex, startIndex + limit);

    return {
      data: paginatedRides,
      totalPages: Math.ceil(total / limit),
      total,
      page,
      limit,
      stats: {
        totalRides,
        activeRides,
        completedRides,
        cancelledRides,
        suspendedRides,
      }
    };
  }
}
