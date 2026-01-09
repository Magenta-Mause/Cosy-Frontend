import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {GameServerDto, GameServerLogMessageEntity} from "@/api/generated/model";

const gameServerLogSlice = createSlice({
  name: "game-server-log-slice",
  initialState: {
    data: {},
  } as { data: { [key: GameServerDto["uuid"]]: GameServerLogMessageEntity[] } },
  reducers: {
    setLogs: (state, action: PayloadAction<GameServerLogMessageEntity[]>) => {
      state.data = Object.groupBy(action.payload, (log) => log.game_server_uuid ?? "") as Record<
        string,
        GameServerLogMessageEntity[]
      >;
    },
    addLog: (state, action: PayloadAction<GameServerLogMessageEntity>) => {
      const serverUuid = action.payload.game_server_uuid ?? "";
      console.log(action.payload, serverUuid);
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
        state.data[serverUuid] = state.data[serverUuid].filter(
          (log) => log.uuid !== action.payload,
        );
      }
    },
    resetLogs: (state) => {
      state.data = {};
    },
  },
});

export const gameServerLogSliceActions = gameServerLogSlice.actions;
export const gameServerLogSliceReducer = gameServerLogSlice.reducer;
