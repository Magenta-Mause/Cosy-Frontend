import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  type GameServerAccessGroupDto,
  type GameServerDto,
  GameServerDtoStatus,
} from "@/api/generated/model";
import type { SliceState } from "@/stores";

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
    initialized: false,
    pullProgress: {},
  } as SliceState<GameServerDto> & { pullProgress: Record<string, DockerPullProgressDto> } & {
    initialized: boolean;
  },
  reducers: {
    setGameServers: (state, action: PayloadAction<GameServerDto[]>) => {
      state.initialized = true;
      state.data = action.payload;
    },
    updateGameServerStatus: (
      state,
      action: PayloadAction<{ uuid: string; status: GameServerDtoStatus }>,
    ) => {
      state.data = state.data.map((server) =>
        server.uuid === action.payload.uuid ? { ...server, status: action.payload.status } : server,
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
        server.uuid === action.payload
          ? { ...server, status: GameServerDtoStatus.AWAITING_UPDATE }
          : server,
      );
    },
    addGameServer: (state, action: PayloadAction<GameServerDto>) => {
      state.initialized = true;
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
    setGameServerState(
      state,
      action: PayloadAction<{ gameServerUuid: string; serverState: GameServerDto["status"] }>,
    ) {
      const index = state.data.findIndex((server) => server.uuid === action.payload.gameServerUuid);
      if (index !== -1) {
        state.data[index].status = action.payload.serverState;
      }
    },
    setGameServerAccessGroups(
      state,
      action: PayloadAction<{
        gameServerUuid: string;
        newAccessGroups: GameServerAccessGroupDto[];
      }>,
    ) {
      const index = state.data.findIndex((server) => server.uuid === action.payload.gameServerUuid);
      if (index !== -1) {
        state.data[index].access_groups = action.payload.newAccessGroups;
      }
    },
    addGameServerAccessGroup(
      state,
      action: PayloadAction<{ gameServerUuid: string; accessGroup: GameServerAccessGroupDto }>,
    ) {
      const index = state.data.findIndex((server) => server.uuid === action.payload.gameServerUuid);
      if (index !== -1) {
        if (!state.data[index].access_groups) state.data[index].access_groups = [];
        state.data[index].access_groups.push(action.payload.accessGroup);
      }
    },
    removeGameServerAccessGroup(
      state,
      action: PayloadAction<{ gameServerUuid: string; accessGroupUuid: string }>,
    ) {
      const index = state.data.findIndex((server) => server.uuid === action.payload.gameServerUuid);
      if (index !== -1) {
        state.data[index].access_groups = state.data[index].access_groups.filter(
          (group) => group.uuid !== action.payload.accessGroupUuid,
        );
      }
    },
  },
});

export const gameServerSliceActions = gameServerSlice.actions;
export const gameServerSliceReducer = gameServerSlice.reducer;
