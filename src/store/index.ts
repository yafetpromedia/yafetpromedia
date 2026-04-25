import { configureStore } from "@reduxjs/toolkit";
import uiReducer from "./slices/uiSlice";
import userReducer from "./slices/userSlice";

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
