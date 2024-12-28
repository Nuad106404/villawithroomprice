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

// Villa API functions
export const villaApi = {
  // Fetch villa details
  async getVillaDetails() {
    const response = await api.get('/admin/villa');
    return response.data;
  },

  // Update villa details
  async updateVillaDetails(data: any) {
    const response = await api.patch('/admin/villa', data);
    return response.data;
  },

  // Upload PromptPay QR
  uploadQRCode: async (file: File) => {
    const formData = new FormData();
    formData.append('qrImage', file);

    const response = await api.post('/admin/villa/promptpay-qr', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete PromptPay QR
  deleteQRCode: async () => {
    const response = await api.delete('/admin/villa/promptpay-qr');
    return response.data;
  },

  // Upload background image
  uploadBackgroundImage: async (file: File) => {
    const formData = new FormData();
    formData.append('backgroundImage', file);

    const response = await api.patch('/admin/villa/background', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Upload slide images
  uploadSlideImages: async (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('slideImages', file);
    });

    const response = await api.post('/admin/villa/slides', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete slide image
  deleteSlideImage: async (index: number) => {
    const response = await api.delete(`/admin/villa/slides/${index}`);
    return response.data;
  },

  // Room management
  addRoom: async (name: { th: string; en: string }, description: { th: string; en: string }, images: File[]) => {
    const formData = new FormData();
    formData.append('name', JSON.stringify(name));
    formData.append('description', JSON.stringify(description));
    images.forEach(file => {
      formData.append('roomImages', file);
    });

    const response = await api.post('/admin/villa/rooms', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateRoom: async (index: number, name: { th: string; en: string }, description: { th: string; en: string }, images?: File[]) => {
    const formData = new FormData();
    formData.append('name', JSON.stringify(name));
    formData.append('description', JSON.stringify(description));
    if (images) {
      images.forEach(file => {
        formData.append('roomImages', file);
      });
    }

    const response = await api.patch(`/admin/villa/rooms/${index}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteRoom: async (index: number) => {
    const response = await api.delete(`/admin/villa/rooms/${index}`);
    return response.data;
  },

  // Villa rooms
  getVillaRooms: async () => {
    const response = await api.get('/villa/rooms');
    return response.data;
  },
};

// Booking API functions
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
  },
};

export default api;