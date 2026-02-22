import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { FooterDto } from "@/api/generated/model";
import type { SliceState } from "@/stores";

const footerSlice = createSlice({
  name: "footer-slice",
  initialState: {
    data: null,
    state: "idle",
  } as SliceState<FooterDto | null>,
  reducers: {
    setFooter: (state, action: PayloadAction<FooterDto>) => {
      state.data = action.payload;
      state.state = "succeeded";
    },
    updateFooter: (state, action: PayloadAction<FooterDto>) => {
      state.data = action.payload;
    },
    setState: (state, action: PayloadAction<SliceState<null>["state"]>) => {
      state.state = action.payload;
    },
  },
});

export const footerSliceActions = footerSlice.actions;
export const footerSliceReducer = footerSlice.reducer;
