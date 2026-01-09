import {useTypedSelector} from "@/stores/rootReducer.ts";
import {useMemo} from "react";

const useGameServer = (serverUuid: string) => {
  const gameServers = useTypedSelector(state => state.gameServerSliceReducer.data);
  return useMemo(() => gameServers.find(server => server.uuid === serverUuid), [gameServers, serverUuid]);
}

export default useGameServer;
