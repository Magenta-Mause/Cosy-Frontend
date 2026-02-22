import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { FooterDto } from "@/api/generated/model";

interface FooterSliceState {
  data: FooterDto | null;
  state: "idle" | "loading" | "failed";
}

const footerSlice = createSlice({
  name: "footer-slice",
  initialState: {
    data: null,
    state: "idle",
  } as FooterSliceState,
  reducers: {
    setFooter: (state, action: PayloadAction<FooterDto>) => {
      state.data = action.payload;
      state.state = "idle";
    },
    updateFooter: (state, action: PayloadAction<FooterDto>) => {
      state.data = action.payload;
    },
    setState: (state, action: PayloadAction<FooterSliceState["state"]>) => {
      state.state = action.payload;
    },
  },
});

export const footerSliceActions = footerSlice.actions;
export const footerSliceReducer = footerSlice.reducer;
