import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  CosyInstanceSettingsDto,
  McRouterConfigurationDto,
  McRouterStatusDto,
} from "@/api/generated/model";

interface CosyInstanceSettingsSliceState {
  settings: CosyInstanceSettingsDto | null;
  mcRouterStatus: McRouterStatusDto | null;
  state: "idle" | "loading" | "failed";
}

const cosyInstanceSettingsSlice = createSlice({
  name: "cosy-instance-settings-slice",
  initialState: {
    settings: null,
    mcRouterStatus: null,
    state: "idle",
  } as CosyInstanceSettingsSliceState,
  reducers: {
    setSettings: (state, action: PayloadAction<CosyInstanceSettingsDto>) => {
      state.settings = action.payload;
      state.state = "idle";
    },
    updateSettings: (state, action: PayloadAction<CosyInstanceSettingsDto>) => {
      state.settings = action.payload;
    },
    updateMcRouterConfiguration: (state, action: PayloadAction<McRouterConfigurationDto>) => {
      if (state.settings) {
        state.settings.mc_router_configuration = action.payload;
      } else {
        state.settings = { mc_router_configuration: action.payload };
      }
    },
    setMcRouterStatus: (state, action: PayloadAction<McRouterStatusDto>) => {
      state.mcRouterStatus = action.payload;
    },
    setState: (state, action: PayloadAction<CosyInstanceSettingsSliceState["state"]>) => {
      state.state = action.payload;
    },
    resetSettings: (state) => {
      state.settings = null;
      state.mcRouterStatus = null;
      state.state = "idle";
    },
  },
});

export const cosyInstanceSettingsSliceActions = cosyInstanceSettingsSlice.actions;
export const cosyInstanceSettingsSliceReducer = cosyInstanceSettingsSlice.reducer;
