import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../lib/axios';
import { Booking } from '../../types/booking';

interface BookingState {
  currentBooking: Booking | null;
  loading: boolean;
  error: string | null;
  selectedDates: {
    checkIn: string | null;
    checkOut: string | null;
  };
  guests: number;
}

const initialState: BookingState = {
  currentBooking: null,
  loading: false,
  error: null,
  selectedDates: {
    checkIn: null,
    checkOut: null,
  },
  guests: 1,
};

export const createBooking = createAsyncThunk(
  'booking/createBooking',
  async (bookingData: Partial<Booking>) => {
    const response = await api.post('/api/bookings', bookingData);
    return response.data;
  }
);

export const fetchBooking = createAsyncThunk(
  'booking/fetchBooking',
  async (bookingId: string) => {
    const response = await api.get(`/api/bookings/${bookingId}`);
    return response.data;
  }
);

export const updateBooking = createAsyncThunk(
  'booking/updateBooking',
  async ({ id, data }: { id: string; data: Partial<Booking> }) => {
    const response = await api.patch(`/api/bookings/${id}`, data);
    return response.data;
  }
);

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setSelectedDates: (state, action) => {
      state.selectedDates = action.payload;
    },
    setGuests: (state, action) => {
      state.guests = action.payload;
    },
    clearBooking: (state) => {
      state.currentBooking = null;
      state.selectedDates = {
        checkIn: null,
        checkOut: null,
      };
      state.guests = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Booking
      .addCase(createBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBooking = action.payload;
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create booking';
      })
      // Fetch Booking
      .addCase(fetchBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBooking = action.payload;
      })
      .addCase(fetchBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch booking';
      })
      // Update Booking
      .addCase(updateBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBooking = action.payload;
      })
      .addCase(updateBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update booking';
      });
  },
});

export const { setSelectedDates, setGuests, clearBooking } = bookingSlice.actions;

export default bookingSlice.reducer;
