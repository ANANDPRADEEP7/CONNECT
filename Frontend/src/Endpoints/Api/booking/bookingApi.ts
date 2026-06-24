import api from "../config/axios";
import type { ApiResponse } from "../../../types/common/api.types";

export interface BookingPayload {
  rideId: string;
  seatsToBook: number;
}

export interface BookingResponse {
  _id: string;
  rideId: any;
  passengerId: any;
  driverId: any;
  seatsBooked: number;
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled" | "rejected";
  createdAt: string;
}

export const bookingApi = {
  createBooking: async (payload: BookingPayload): Promise<ApiResponse<BookingResponse>> => {
    const response = await api.post<ApiResponse<BookingResponse>>("/booking", payload);
    return response.data;
  },

  getMyBookings: async (): Promise<ApiResponse<BookingResponse[]>> => {
    const response = await api.get<ApiResponse<BookingResponse[]>>("/booking/my-bookings");
    return response.data;
  },

  getDriverBookings: async (): Promise<ApiResponse<BookingResponse[]>> => {
    const response = await api.get<ApiResponse<BookingResponse[]>>("/booking/driver-bookings");
    return response.data;
  },

  updateBookingStatus: async (
    bookingId: string,
    status: "confirmed" | "cancelled" | "rejected"
  ): Promise<ApiResponse<BookingResponse>> => {
    const response = await api.patch<ApiResponse<BookingResponse>>(`/booking/${bookingId}/status`, { status });
    return response.data;
  },
};
