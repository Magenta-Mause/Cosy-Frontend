import { useDispatch } from "react-redux";
import { useSubscription } from "react-stomp-hooks";
import { useTypedSelector } from "@/stores/rootReducer.ts";
import { gameServerLogSliceActions } from "@/stores/slices/gameServerLogSlice.ts";
import { gameServerSliceActions } from "@/stores/slices/gameServerSlice.ts";
import type { GameServerDtoStatus, GameServerStatusDto } from "@/api/generated/model";

const WebSocketCollection = () => {
  const gameServer = useTypedSelector((state) => state.gameServerSliceReducer.data);
  const dispatch = useDispatch();

  useSubscription(
    gameServer
      ? gameServer.map((server) => `/topics/game-servers/${server.uuid}/status`)
      : [],
    (message) => {
      const messageBody = JSON.parse(message.body) as GameServerStatusDto;
      const destination = message.headers.destination;
      if (destination && messageBody.status) {
        const match = destination.match(/\/topics\/game-servers\/([^/]+)\/status/);
        if (match?.[1]) {
          dispatch(
            gameServerSliceActions.updateGameServerStatus({
              uuid: match[1],
              status: messageBody.status as unknown as GameServerDtoStatus,
            }),
          );
        }
      }
    },
  );

  useSubscription(
    gameServer
      ? gameServer.map((server) => `/topics/game-server-logs/creation/${server.uuid}`)
      : [],
    (message) => {
      const messageBody = JSON.parse(message.body);
      dispatch(gameServerLogSliceActions.addLog(messageBody));
    },
  );
  return null;
};

export default WebSocketCollection;
