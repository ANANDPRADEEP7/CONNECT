import api from "../config/axios";

export interface RidePayload {
  from: string;
  to: string;
  date: string;
  time: string;
  seats: number;
  pricePerSeat: number;
  description?: string;
}

export interface Ride {
  _id: string;
  riderId: string;
  from: string;
  to: string;
  date: string;
  time: string;
  seats: number;
  pricePerSeat: number;
  description?: string;
  status: "active" | "completed" | "cancelled";
  createdAt: string;
}

export const rideApi = {
  /** POST /ride – Publish a new ride */
  createRide: async (data: RidePayload): Promise<{ message: string; ride: Ride }> => {
    const response = await api.post("/ride", data);
    return response.data;
  },

  /** GET /ride – Fetch all active rides */
  getRides: async (): Promise<Ride[]> => {
    const response = await api.get("/ride");
    return response.data;
  },

  /** GET /ride/my – Fetch the logged-in rider's own rides */
  getMyRides: async (): Promise<Ride[]> => {
    const response = await api.get("/ride/my");
    return response.data;
  },
};
