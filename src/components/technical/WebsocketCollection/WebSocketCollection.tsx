import {v7 as generateUuid} from "uuid";
import {useDispatch} from "react-redux";
import {useSubscription} from "react-stomp-hooks";
import {useTypedSelector} from "@/stores/rootReducer.ts";
import {gameServerLogSliceActions} from "@/stores/slices/gameServerLogSlice.ts";

const WebSocketCollection = () => {
  const gameServer = useTypedSelector((state) => state.gameServerSliceReducer.data);
  const dispatch = useDispatch();

  useSubscription(
    gameServer
      ? gameServer.map((server) => `/topics/game-server-logs/creation/${server.uuid}`)
      : [],
    (message) => {
      const messageBody = JSON.parse(message.body);
      messageBody["uuid"] = generateUuid();
      dispatch(gameServerLogSliceActions.addLog(messageBody));
    },
  );
  return null;
};

export default WebSocketCollection;
