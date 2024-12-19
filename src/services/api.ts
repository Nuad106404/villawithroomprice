import axios from 'axios';
import type { CustomerInfo } from '../types/booking';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface BookingData {
  _id?: string;
  customerInfo: CustomerInfo;
  bookingDetails: {
    checkIn: Date;
    checkOut: Date;
    guests: number;
    totalPrice: number;
  };
  status: 'pending' | 'confirmed' | 'cancelled';
}

export const bookingApi = {
  createBooking: async (bookingData: BookingData) => {
    try {
      const response = await api.post('/bookings', bookingData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to create booking');
      }
      throw error;
    }
  },

  updateBooking: async (id: string, data: Partial<BookingData>) => {
    try {
      const endpoint = data.paymentDetails ? `/bookings/${id}/payment` : `/bookings/${id}/customer-info`;
      const response = await api.patch(endpoint, data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to update booking');
      }
      throw error;
    }
  },

  getBooking: async (id: string) => {
    try {
      const response = await api.get(`/bookings/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch booking');
      }
      throw error;
    }
  },

  getAllBookings: async () => {
    try {
      const response = await api.get('/bookings');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch bookings');
      }
      throw error;
    }
  },

  updateBookingStatus: async (id: string, status: 'pending' | 'confirmed' | 'cancelled') => {
    try {
      const response = await api.patch(`/bookings/${id}`, { status });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to update booking status');
      }
      throw error;
    }
  }
};
