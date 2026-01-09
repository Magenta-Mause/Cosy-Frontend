import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { GameServerDto } from "@/api/generated/model";
import type { SliceState } from "@/stores";

const gameServerSlice = createSlice({
  name: "game-server-slice",
  initialState: {
    data: [],
    state: "idle",
  } as SliceState<GameServerDto>,
  reducers: {
    setGameServer: (state, action: PayloadAction<GameServerDto[]>) => {
      state.data = action.payload;
    },
    addGameServer: (state, action: PayloadAction<GameServerDto>) => {
      state.data.push(action.payload);
    },
    removeGameServer: (state, action: PayloadAction<string>) => {
      state.data = state.data.filter(
        (gameServerConfiguration) => gameServerConfiguration.uuid !== action.payload,
      );
    },
    resetGameServers: (state) => {
      state.data = [];
    },
    setState: (state, action: PayloadAction<SliceState<null>["state"]>) => {
      state.state = action.payload;
    },
    updateGameServer: (state, action: PayloadAction<GameServerDto>) => {
      const index = state.data.findIndex((server) => server.uuid === action.payload.uuid);
      if (index !== -1) {
        state.data[index] = action.payload;
      }
    },
  },
});

export const gameServerSliceActions = gameServerSlice.actions;
export const gameServerSliceReducer = gameServerSlice.reducer;
