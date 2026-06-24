import type { ApiResponse } from "../../../types/common/api.types";
import type { Vehicle, VehiclePayload } from "../../../types/vehicle/vehicle.types";
import api from "../config/axios";
import { VEHICLE_API_ROUTES } from "../constants/apiRoutes.constants";

export const vehicleApi = {
  /** POST /vehicle – Add a new vehicle */
  createVehicle: async (data: VehiclePayload): Promise<ApiResponse<Vehicle>> => {
    const response = await api.post(VEHICLE_API_ROUTES.CREATE, data);
    return response.data;
  },

  /** GET /vehicle/my – Fetch all of the rider's vehicles */
  getMyVehicles: async (): Promise<ApiResponse<Vehicle[]>> => {
    const response = await api.get(VEHICLE_API_ROUTES.GET_MY);
    return response.data;
  },

  /** GET /vehicle/:id – Fetch a single vehicle by ID */
  getVehicleById: async (id: string): Promise<ApiResponse<Vehicle>> => {
    const response = await api.get(VEHICLE_API_ROUTES.GET_BY_ID(id));
    return response.data;
  },

  /** PATCH /vehicle/:id – Update vehicle details */
  updateVehicle: async (id: string, data: Partial<VehiclePayload>): Promise<ApiResponse<Vehicle>> => {
    const response = await api.patch(VEHICLE_API_ROUTES.UPDATE(id), data);
    return response.data;
  },

  /** DELETE /vehicle/:id – Delete a vehicle */
  deleteVehicle: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(VEHICLE_API_ROUTES.DELETE(id));
    return response.data;
  },
};
