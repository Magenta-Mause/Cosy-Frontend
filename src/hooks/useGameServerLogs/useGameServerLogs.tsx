import {useTypedSelector} from "@/stores/rootReducer.ts";
import {useMemo} from "react";

const useGameServerLogs = (serverId: string) => {
  const gameServerLogs = useTypedSelector(state => state.gameServerLogSliceReducer.data);
  return useMemo(() => {
    if (!gameServerLogs || !gameServerLogs[serverId]) {
      return [];
    }
    return gameServerLogs[serverId];
  }, [gameServerLogs, serverId]);
}

export default useGameServerLogs;
