import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { TemplateEntity } from "@/api/generated/model";
import type { SliceState } from "@/stores";

const templateSlice = createSlice({
  name: "template-slice",
  initialState: {
    data: [],
    state: "idle",
  } as SliceState<TemplateEntity>,
  reducers: {
    setTemplates: (state, action: PayloadAction<TemplateEntity[]>) => {
      state.data = action.payload;
    },
    addTemplate: (state, action: PayloadAction<TemplateEntity>) => {
      state.data.push(action.payload);
    },
    setState: (state, action: PayloadAction<SliceState<null>["state"]>) => {
      state.state = action.payload;
    },
  },
});

export const templateSliceActions = templateSlice.actions;
export const templateSliceReducer = templateSlice.reducer;
