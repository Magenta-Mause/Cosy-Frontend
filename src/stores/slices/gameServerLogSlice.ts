import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { GameServerDto, GameServerLogMessageEntity } from "@/api/generated/model";
import type { SliceState } from "@/stores";

export type GameServerLogWithUuid = GameServerLogMessageEntity & { uuid: string };

interface GameServerLogSliceState {
  data: {
    [key: GameServerDto["uuid"]]: {
      logs: GameServerLogWithUuid[];
      state: SliceState<void>["state"];
    };
  };
}

const gameServerLogSlice = createSlice({
  name: "game-server-log-slice",
  initialState: {
    data: {},
  } as GameServerLogSliceState,
  reducers: {
    setLogs: (state, action: PayloadAction<GameServerLogWithUuid[]>) => {
      const grouped = Object.groupBy(action.payload, (log) => log.game_server_uuid ?? "") as Record<
        string,
        GameServerLogWithUuid[]
      >;
      const withStatus: GameServerLogSliceState["data"] = {};
      Object.keys(grouped).forEach((key) => {
        withStatus[key] = {
          logs: grouped[key],
          state: "loading",
        };
      });
      state.data = withStatus;
    },
    addLog: (state, action: PayloadAction<GameServerLogWithUuid>) => {
      const serverUuid = action.payload.game_server_uuid ?? "";
      if (!serverUuid) return;
      if (state.data[serverUuid]) {
        state.data[serverUuid].logs.push(action.payload);
      } else {
        state.data[serverUuid] = { logs: [action.payload], state: "loading" };
      }
    },
    removeLog: (state, action: PayloadAction<string>) => {
      for (const serverUuid in state.data) {
        if (!state.data[serverUuid]) continue;
        state.data[serverUuid].logs = state.data[serverUuid].logs.filter(
          (log) => log.uuid !== action.payload,
        );
      }
    },
    setGameServerLogs: (
      state,
      action: PayloadAction<{
        gameServerUuid: GameServerDto["uuid"];
        logs: GameServerLogWithUuid[];
      }>,
    ) => {
      state.data[action.payload.gameServerUuid].logs = action.payload.logs;
    },
    resetLogs: (state) => {
      state.data = {};
    },
    setState: (
      state,
      action: PayloadAction<{
        gameServerUuid: GameServerDto["uuid"];
        state: SliceState<void>["state"];
      }>,
    ) => {
      if (!state.data[action.payload.gameServerUuid]) {
        state.data[action.payload.gameServerUuid] = { state: "loading", logs: [] };
      }
      state.data[action.payload.gameServerUuid].state = action.payload.state;
    },
    removeLogsFromServer(state, action: PayloadAction<string>) {
      delete state.data[action.payload];
    },
  },
});

export const gameServerLogSliceActions = gameServerLogSlice.actions;
export const gameServerLogSliceReducer = gameServerLogSlice.reducer;
