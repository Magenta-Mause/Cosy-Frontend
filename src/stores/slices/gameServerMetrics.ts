import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { GameServerDto, MetricPointDto } from "@/api/generated/model";
import type { SliceState } from "@/stores";

export type GameServerMetricsWithUuid = MetricPointDto & { uuid: string };

interface GameServerMetricsSliceState {
  data: {
    [key: GameServerDto["uuid"]]: {
      metrics: GameServerMetricsWithUuid[];
      state: SliceState<void>["state"];
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
        (metric) => metric.uuid ?? "",
      ) as Record<string, GameServerMetricsWithUuid[]>;
      const withStatus: GameServerMetricsSliceState["data"] = {};
      Object.keys(grouped).forEach((key) => {
        withStatus[key] = {
          metrics: grouped[key],
          state: "loading",
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
        };
      }
      state.data[action.payload.gameServerUuid].state = action.payload.state;
    },
  },
});

export const gameServerMetricsSliceActions = gameServerMetricsSlice.actions;
export const gameServerMetricsSliceReducer = gameServerMetricsSlice.reducer;
