import {createSlice, type PayloadAction} from "@reduxjs/toolkit";
import type {GameServerDto, GameServerLogMessage} from "@/api/generated/model";
import type {SliceState} from "@/stores";

const gameServerLogSlice = createSlice({
  name: "game-server-log-slice",
  initialState: {
    data: {},
  } as { data: { [key: GameServerDto["uuid"]]: GameServerLogMessage[] } },
  reducers: {
    setLogs: (state, action: PayloadAction<GameServerLogMessage[]>) => {
      state.data = Object.groupBy(
        action.payload,
        log => log.gameServerUuid ?? ""
      ) as Record<string, GameServerLogMessage[]>;
    },
    addLog: (state, action: PayloadAction<GameServerLogMessage>) => {
      const serverUuid = action.payload.gameServerUuid;
      if (!serverUuid) return;
      if (state.data[serverUuid]) {
        state.data[serverUuid].push(action.payload);
      } else {
        state.data[serverUuid] = [action.payload];
      }
    },
    removeLog: (state, action: PayloadAction<string>) => {
      for (const serverUuid in state.data) {
        if (!state.data[serverUuid]) continue;
        state.data[serverUuid] = state.data[serverUuid].filter(log => log.uuid !== action.payload);
      }
    },
    resetLogs: (state) => {
      state.data = {};
    },
  },
});

export const gameServerLogSliceActions = gameServerLogSlice.actions;
export const gameServerLogSliceReducer = gameServerLogSlice.reducer;
