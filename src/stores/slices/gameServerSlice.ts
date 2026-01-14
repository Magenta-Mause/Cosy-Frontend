import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { GameServerDto, GameServerDtoStatus } from "@/api/generated/model";
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
    updateGameServerStatus: (
      state,
      action: PayloadAction<{ uuid: string; status: GameServerDtoStatus }>,
    ) => {
      const server = state.data.find((s) => s.uuid === action.payload.uuid);
      if (server) {
        server.status = action.payload.status;
      }
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
  },
});

export const gameServerSliceActions = gameServerSlice.actions;
export const gameServerSliceReducer = gameServerSlice.reducer;
