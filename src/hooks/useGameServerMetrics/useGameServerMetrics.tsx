import { useMemo } from "react";
import { useTypedSelector } from "@/stores/rootReducer.ts";

const useGameServerMetrics = (serverId: string) => {
  const gameServerMetrics = useTypedSelector((state) => state.gameServerMetricsSliceReducer.data);
  return useMemo(() => {
    if (!gameServerMetrics || !gameServerMetrics[serverId]) {
      return { state: "failed", metrics: [] };
    }
    return gameServerMetrics[serverId];
  }, [gameServerMetrics, serverId]);
};

export default useGameServerMetrics;
