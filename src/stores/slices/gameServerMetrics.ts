import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { GameServerDto, MetricPointDto } from "@/api/generated/model";
import type { SliceState } from "@/stores";

export type GameServerMetricsWithUuid = MetricPointDto & { uuid: string };

interface GameServerMetricsSliceState {
  data: {
    [key: GameServerDto["uuid"]]: {
      metrics: GameServerMetricsWithUuid[];
      state: SliceState<void>["state"];
      enableMetricsLiveUpdates: boolean;
    };
  };
}

const gameServerMetricsSlice = createSlice({
  name: "game-server-metrics-slice",
  initialState: {
    data: {},
  } as GameServerMetricsSliceState,
  reducers: {
    setMetrics: (
      state,
      action: PayloadAction<{
        gameServerUuid: GameServerDto["uuid"];
        metrics: GameServerMetricsWithUuid[];
      }>,
    ) => {
      const grouped = Object.groupBy(
        action.payload.metrics,
        (metric) => metric.game_server_uuid ?? "",
      ) as Record<string, GameServerMetricsWithUuid[]>;
      const withStatus: GameServerMetricsSliceState["data"] = {};
      Object.keys(grouped).forEach((key) => {
        withStatus[key] = {
          metrics: grouped[key],
          state: "loading",
          enableMetricsLiveUpdates: true,
        };
      });
      state.data = withStatus;
    },
    setGameServerMetrics: (
      state,
      action: PayloadAction<{
        gameServerUuid: GameServerDto["uuid"];
        metrics: GameServerMetricsWithUuid[];
      }>,
    ) => {
      const { gameServerUuid, metrics } = action.payload;

      if (!state.data[gameServerUuid]) {
        state.data[gameServerUuid] = {
          metrics: [],
          state: "idle",
          enableMetricsLiveUpdates: true,
        };
      }

      state.data[gameServerUuid].metrics = metrics;
    },
    setState: (
      state,
      action: PayloadAction<{
        gameServerUuid: GameServerDto["uuid"];
        state: SliceState<void>["state"];
      }>,
    ) => {
      if (!state.data[action.payload.gameServerUuid]) {
        state.data[action.payload.gameServerUuid] = {
          state: "loading",
          metrics: [],
          enableMetricsLiveUpdates: true,
        };
      }
      state.data[action.payload.gameServerUuid].state = action.payload.state;
    },
    addMetrics: (state, action: PayloadAction<GameServerMetricsWithUuid>) => {
      const serverUuid = action.payload.game_server_uuid ?? "";
      if (!serverUuid) return;
      if (state.data[serverUuid]) {
        state.data[serverUuid].metrics.push(action.payload);
      } else {
        state.data[serverUuid] = {
          metrics: [action.payload],
          state: "loading",
          enableMetricsLiveUpdates: true,
        };
      }
    },
    setEnableMetricsLiveUpdates: (
      state,
      action: PayloadAction<{
        gameServerUuid: GameServerDto["uuid"];
        enable: boolean;
      }>,
    ) => {
      const { gameServerUuid, enable } = action.payload;

      if (!state.data[gameServerUuid]) {
        state.data[gameServerUuid] = {
          metrics: [],
          state: "idle",
          enableMetricsLiveUpdates: enable,
        };
      } else {
        state.data[gameServerUuid].enableMetricsLiveUpdates = enable;
      }
    },
    removeMetricsFromServer(state, action: PayloadAction<string>) {
      delete state.data[action.payload];
    },
  },
});

export const gameServerMetricsSliceActions = gameServerMetricsSlice.actions;
export const gameServerMetricsSliceReducer = gameServerMetricsSlice.reducer;
