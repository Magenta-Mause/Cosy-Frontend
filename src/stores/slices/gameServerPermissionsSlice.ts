import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { GameServerAccessGroupPermissionsItem, GameServerDto } from "@/api/generated/model";
import type { SliceState } from "@/stores";

interface GameServerPermissionsSliceState {
  data: {
    [key: GameServerDto["uuid"]]: {
      permissions: string[];
      state: SliceState<void>["state"];
    };
  };
}

const gameServerPermissionsSlice = createSlice({
  name: "game-server-permissions-slice",
  initialState: {
    data: {},
  } as GameServerPermissionsSliceState,
  reducers: {
    setGameServerPermissions: (
      state,
      action: PayloadAction<{
        gameServerUuid: string;
        permissions: GameServerAccessGroupPermissionsItem[];
      }>,
    ) => {
      state.data[action.payload.gameServerUuid] = {
        permissions: action.payload.permissions,
        state: "idle",
      };
    },
    updateGameServerPermissionsStatus: (
      state,
      action: PayloadAction<{ gameServerUuid: string; status: SliceState<void>["state"] }>,
    ) => {
      if (!Object.hasOwn(state.data, action.payload.gameServerUuid)) {
        state.data[action.payload.gameServerUuid] = { permissions: [], state: "idle" };
      }
      state.data[action.payload.gameServerUuid].state = action.payload.status;
    },
    removeGameServerPermissions: (state, action: PayloadAction<string>) => {
      delete state.data[action.payload];
    },
    resetState: (state) => {
      state.data = {};
    },
  },
});

export const gameServerPermissionsSliceActions = gameServerPermissionsSlice.actions;
export const gameServerPermissionsSliceReducer = gameServerPermissionsSlice.reducer;
