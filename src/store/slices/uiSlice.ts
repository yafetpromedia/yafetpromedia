import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UIState {
  isModalOpen: boolean;
  theme: "light" | "dark";
}

const initialState: UIState = {
  isModalOpen: false,
  theme: "dark",
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleModal: (state) => {
      state.isModalOpen = !state.isModalOpen;
    },
    setTheme: (state, action: PayloadAction<"light" | "dark">) => {
      state.theme = action.payload;
    },
  },
});

export const { toggleModal, setTheme } = uiSlice.actions;
export default uiSlice.reducer;
