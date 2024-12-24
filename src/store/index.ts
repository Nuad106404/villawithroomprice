import { configureStore, createSlice } from '@reduxjs/toolkit';

// Create a temporary reducer since we removed auth
const appSlice = createSlice({
  name: 'app',
  initialState: {},
  reducers: {}
});

export const store = configureStore({
  reducer: {
    app: appSlice.reducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
