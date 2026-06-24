import type { ApiResponse } from "../../../types/common/api.types";
import type { Ride, RidePayload, SearchRide, SearchRidesParams } from "../../../types/ride/ride.types";
import api from "../config/axios";
import { RIDE_API_ROUTES } from "../constants/apiRoutes.constants";

export const rideApi = {
  /** POST /ride – Publish a new ride */
  createRide: async (data: RidePayload): Promise<ApiResponse<Ride>> => {
    const response = await api.post(RIDE_API_ROUTES.CREATE_RIDE, data);
    return response.data;
  },

  /** GET /ride/search – Search rides by query parameters */
  searchRides: async (params: SearchRidesParams): Promise<ApiResponse<SearchRide[]>> => {
    const response = await api.get(RIDE_API_ROUTES.SEARCH_RIDES, { params });
    return response.data;
  },

  /** GET /ride – Fetch all active rides */
  getRides: async (): Promise<ApiResponse<Ride[]>> => {
    const response = await api.get(RIDE_API_ROUTES.GET_RIDES);
    return response.data;
  },

  /** GET /ride/my – Fetch the logged-in rider's own rides */
  getMyRides: async (): Promise<ApiResponse<Ride[]>> => {
    const response = await api.get(RIDE_API_ROUTES.GET_MY_RIDES);
    return response.data;
  },

  /** GET /ride/:id – Fetch a single ride by ID */
  getRideById: async (id: string): Promise<ApiResponse<Ride>> => {
    const response = await api.get(RIDE_API_ROUTES.GET_RIDE_BY_ID(id));
    return response.data;
  },

  /** PATCH /ride/:id – Update ride details */
  updateRide: async (id: string, data: Partial<RidePayload>): Promise<ApiResponse<Ride>> => {
    const response = await api.patch(RIDE_API_ROUTES.UPDATE_RIDE(id), data);
    return response.data;
  },

  /** PATCH /ride/:id/cancel – Cancel a ride */
  cancelRide: async (id: string, reason: string): Promise<ApiResponse<void>> => {
    const response = await api.patch(RIDE_API_ROUTES.CANCEL_RIDE(id), { reason });
    return response.data;
  },

};
