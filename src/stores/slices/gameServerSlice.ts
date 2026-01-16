import {createSlice, type PayloadAction} from "@reduxjs/toolkit";
import {type GameServerDto, GameServerDtoStatus} from "@/api/generated/model";
import type {SliceState} from "@/stores";

export interface DockerPullProgressDto {
  status: string;
  id?: string;
  progressDetail?: string;
  current?: number;
  total?: number;
}

const gameServerSlice = createSlice({
  name: "game-server-slice",
  initialState: {
    data: [],
    state: "idle",
    pullProgress: {},
  } as SliceState<GameServerDto> & { pullProgress: Record<string, DockerPullProgressDto> },
  reducers: {
    setGameServer: (state, action: PayloadAction<GameServerDto[]>) => {
      state.data = action.payload;
    },
    updateGameServerStatus: (
      state,
      action: PayloadAction<{ uuid: string; status: GameServerDtoStatus }>,
    ) => {
      state.data = state.data.map((server) =>
        server.uuid === action.payload.uuid
          ? {...server, status: action.payload.status}
          : server,
      );
    },
    updatePullProgress: (
      state,
      action: PayloadAction<{ uuid: string; progress: DockerPullProgressDto }>,
    ) => {
      state.pullProgress = {
        ...state.pullProgress,
        [action.payload.uuid]: action.payload.progress,
      };
    },
    awaitPendingUpdate: (state, action: PayloadAction<string>) => {
      state.data = state.data.map((server) =>
        server.uuid === action.payload ? {...server, status: GameServerDtoStatus.AWAITING_UPDATE} : server,
      );
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
