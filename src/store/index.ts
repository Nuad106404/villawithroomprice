import { configureStore } from '@reduxjs/toolkit';
import bookingReducer from './slices/bookingSlice';
import adminReducer from './slices/adminSlice';
import villaReducer from './slices/villaSlice';

export const store = configureStore({
  reducer: {
    booking: bookingReducer,
    admin: adminReducer,
    villa: villaReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
