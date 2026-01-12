import { useMemo } from "react";
import { useTypedSelector } from "@/stores/rootReducer.ts";

const useGameServerLogs = (serverId: string) => {
  const gameServerLogs = useTypedSelector((state) => state.gameServerLogSliceReducer.data);
  return useMemo(() => {
    if (!gameServerLogs || !gameServerLogs[serverId]) {
      return {state: "failed", logs: []};
    }
    return gameServerLogs[serverId];
  }, [gameServerLogs, serverId]);
};

export default useGameServerLogs;
